'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '@/components/ui/card-snippet';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, differenceInCalendarDays } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CarGrid, Car } from '@/components/fleet';
import { CarFirebaseService } from '@/lib/firebase-car-service';
import { Timestamp } from 'firebase/firestore';
import { CarListing } from '@/data/car-listings-data';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/error-boundary';
import {
  BookingConfirmationDialog,
  BookingFormData,
} from '@/components/booking/booking-confirmation-dialog';
import { useUserStore } from '@/store';
import { createDetailedPricing } from '@/lib/pricing-utils';

// Session cache key
const CARS_SESSION_CACHE_KEY = 'booking:cars';

// Convert CarListing data to Car data format for fleet display
const convertCarListingToCar = (carListing: CarListing): Car => {
  // Add promotional indicator to features if the car is promotional
  const features = carListing.features;

  // Provide fallback for missing or invalid image URLs
  const imageUrl =
    carListing.image && carListing.image.trim() !== ''
      ? carListing.image
      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3ECar Image%3C/text%3E%3C/svg%3E";

  return {
    id: parseInt(carListing.id) || Math.random(), // Convert string id to number
    name: carListing.isPromo ? `🔥 ${carListing.name}` : carListing.name,
    image: imageUrl,
    price: carListing.price,
    isPromo: carListing.isPromo,
    // Ensure priority is present and numeric for sorting
    ...({
      priorityLevel:
        typeof (carListing as any).priorityLevel === 'number'
          ? (carListing as any).priorityLevel
          : parseInt(String((carListing as any).priorityLevel), 10) || 0,
    } as any),
    category: carListing.category,
    passengers: carListing.passengers,
    bags: carListing.bags,
    transmission: carListing.transmission,
    features: features,
    // Keep a stable reference to the Firestore document id for merging updates
    // (not part of the Car type, used internally only)
    ...({ docId: carListing.id, updatedDate: carListing.updatedDate } as any),
  };
};

// Ensure a list has unique cars by stable key
const uniqueByDocId = (items: Car[]): Car[] => {
  const seen = new Set<string>();
  const out: Car[] = [];
  items.forEach((c: any) => {
    const key = String(c.docId ?? c.id ?? c.name);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
  });
  return out;
};

// Normalize a name by stripping promo emoji/whitespace and lowercasing
const normalizeName = (name: string) => name.replace(/🔥/g, '').trim().toLowerCase();

// Keep only one car per vehicle name; prefer promo, else latest updated
const uniqueByVehicleName = (items: Car[]): Car[] => {
  const map = new Map<string, any>();
  items.forEach((c: any) => {
    const key = normalizeName(c.name || '');
    const existing = map.get(key);
    if (!existing) {
      map.set(key, c);
      return;
    }
    const existingIsPromo = !!existing.isPromo;
    const currentIsPromo = !!c.isPromo;
    if (currentIsPromo && !existingIsPromo) {
      map.set(key, c);
      return;
    }
    const existingUpdated = existing.updatedDate?.getTime?.() || 0;
    const currentUpdated = c.updatedDate?.getTime?.() || 0;
    if (currentUpdated > existingUpdated) {
      map.set(key, c);
    }
  });
  return Array.from(map.values());
};

const BookingPage = () => {
  const [destination, setDestination] = useState('');
  // Set default dates: pickup = today, return = tomorrow
  const [pickupDate, setPickupDate] = useState<Date>(new Date());
  const [returnDate, setReturnDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [pickupTime, setPickupTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [driveOption, setDriveOption] = useState<'self-drive' | 'with-driver'>('self-drive');
  const [pickUpAddress, setPickUpAddress] = useState('');
  const [returnAddress, setReturnAddress] = useState('');

  // Confirmation dialog state
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  // Firebase data state
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User store for verification status
  const { user } = useUserStore();

  // Helpers for session cache
  const readCache = useCallback((): { cars: Car[]; lastUpdatedMs: number } | null => {
    try {
      const raw = sessionStorage.getItem(CARS_SESSION_CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const writeCache = useCallback((carsToStore: Car[]) => {
    try {
      const latest = carsToStore
        .map((c: any) => c.updatedDate?.getTime?.() || 0)
        .reduce((a, b) => Math.max(a, b), 0);
      sessionStorage.setItem(
        CARS_SESSION_CACHE_KEY,
        JSON.stringify({ cars: carsToStore, lastUpdatedMs: latest })
      );
    } catch {}
  }, []);

  const cacheKey = useMemo(() => 'all_cars', []);

  // Fetch cars; use cache first and attach realtime listener for updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const cached = readCache();
        if (cached && cached.cars.length > 0) {
          const normalized = uniqueByVehicleName(uniqueByDocId(cached.cars));
          normalized.sort((a: any, b: any) => (b.priorityLevel || 0) - (a.priorityLevel || 0));
          setCars(normalized);
          setLoading(false);

          const lastTs = cached.lastUpdatedMs ? Timestamp.fromMillis(cached.lastUpdatedMs) : null;
          unsubscribe = CarFirebaseService.listenToCarsSince(
            lastTs,
            (changedCars) => {
              if (!changedCars || changedCars.length === 0) return;
              setCars((prev) => {
                const map = new Map<string, any>();
                prev.forEach((c: any) => map.set(String(c.docId ?? c.id), c));
                changedCars.forEach((listing) => {
                  const converted = convertCarListingToCar(listing as any);
                  map.set(String((listing as any).id), converted);
                });
                const merged = uniqueByVehicleName(
                  uniqueByDocId(Array.from(map.values()) as Car[])
                );
                // Sort strictly by priorityLevel (desc)
                merged.sort((a: any, b: any) => (b.priorityLevel || 0) - (a.priorityLevel || 0));
                writeCache(merged);
                return merged;
              });
            },
            (error) => {
              console.error('Cars listener error:', error);
            }
          );
          return;
        }

        // No cache → fetch once and then attach listener
        const carListings = await CarFirebaseService.getAllCars();
        const convertedCars = uniqueByVehicleName(
          uniqueByDocId(carListings.map(convertCarListingToCar))
        );
        setCars(convertedCars);
        writeCache(convertedCars);
        toast.success(`Loaded ${convertedCars.length} vehicles`);

        const lastTs = carListings[0]?.updatedDate ? (carListings[0].updatedDate as any) : null;
        unsubscribe = CarFirebaseService.listenToCarsSince(
          lastTs,
          (changedCars) => {
            if (!changedCars || changedCars.length === 0) return;
            setCars((prev) => {
              const map = new Map<string, any>();
              prev.forEach((c: any) => map.set(String(c.docId ?? c.id), c));
              changedCars.forEach((listing) => {
                const converted = convertCarListingToCar(listing as any);
                map.set(String((listing as any).id), converted);
              });
              const merged = uniqueByVehicleName(uniqueByDocId(Array.from(map.values()) as Car[]));
              merged.sort((a: any, b: any) => (b.priorityLevel || 0) - (a.priorityLevel || 0));
              writeCache(merged);
              return merged;
            });
          },
          (error) => {
            console.error('Cars listener error:', error);
          }
        );
      } catch (err) {
        setError('Failed to load vehicles. Please try again.');
        toast.error('Failed to load vehicles');
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    init();
    return () => unsubscribe?.();
  }, [cacheKey, readCache, writeCache]);

  const addressOptions = [
    { value: 'nacs-garage', label: 'Self Pick Up @ NACS Car Rental Garage' },
    { value: 'pagadian-airport', label: 'Pagadian Airport' },
    { value: 'pagadian-area', label: 'Pagadian Area' },
  ];

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '10', '20', '30', '40', '50'];
  const periods = ['AM', 'PM'];

  // Constants for discount configuration (matching CarCard logic)
  const DISCOUNT_CONFIG = {
    VERIFIED_USER: 0.05,
    PROMO_CAR: 0.1,
    DURATION_TIERS: [
      { maxDays: 1, additionalDiscount: 0 },
      { maxDays: 3, additionalDiscount: 0.025 },
      { maxDays: 7, additionalDiscount: 0.05 },
      { maxDays: 14, additionalDiscount: 0.1 },
      { maxDays: 21, additionalDiscount: 0.2 },
      { maxDays: 29, additionalDiscount: 0.25 },
      { maxDays: Infinity, additionalDiscount: 0.3 },
    ],
  };

  // Driver fee per day (matching CarCard)
  const DRIVER_FEE_PER_DAY = 750;

  const calculatePricingDetails = (car: Car) => {
    const totalDays = Math.max(1, differenceInCalendarDays(returnDate, pickupDate));
    const basePricePerDay = parseInt(car.price.replace(/[^0-9]/g, ''));
    const isVerifiedUser = user?.isVerified ?? false;

    if (basePricePerDay === 0) {
      return createDetailedPricing({
        basePricePerDay: 0,
        totalDays,
        driverFeePerDay: 0,
        discounts: [],
        extraCharges: [],
      });
    }

    // Build discounts array for detailed pricing
    const discounts = [];

    // Verified User Discount (5% off vehicle rental)
    if (isVerifiedUser && DISCOUNT_CONFIG.VERIFIED_USER > 0) {
      discounts.push({
        label: 'Verified User Discount',
        type: 'verified_user',
        percentageOff: DISCOUNT_CONFIG.VERIFIED_USER * 100,
        appliedTo: 'vehicle' as const,
        applied: true,
      });
    }

    // Promotional Car Discount (10% off vehicle rental)
    if (car.isPromo && DISCOUNT_CONFIG.PROMO_CAR > 0) {
      discounts.push({
        label: 'Promotional Vehicle',
        type: 'promo_vehicle',
        percentageOff: DISCOUNT_CONFIG.PROMO_CAR * 100,
        appliedTo: 'vehicle' as const,
        applied: true,
      });
    }

    // Duration-based Discount
    const durationTier = DISCOUNT_CONFIG.DURATION_TIERS.find((tier) => totalDays <= tier.maxDays);
    const additionalDiscount = durationTier?.additionalDiscount ?? 0;

    if (additionalDiscount > 0) {
      let durationLabel = 'Extended Rental';

      if (totalDays <= 3) durationLabel = 'Short-term Rental (2-3 days)';
      else if (totalDays <= 7) durationLabel = 'Weekly Rental (4-7 days)';
      else if (totalDays <= 14) durationLabel = 'Bi-weekly Rental (8-14 days)';
      else if (totalDays <= 21) durationLabel = 'Long-term Rental (15-21 days)';
      else if (totalDays <= 29) durationLabel = 'Monthly Rental (22-29 days)';
      else durationLabel = 'Extended Monthly Rental (30+ days)';

      discounts.push({
        label: durationLabel,
        type: 'duration',
        percentageOff: additionalDiscount * 100,
        appliedTo: 'vehicle' as const,
        applied: true,
      });
    }

    // Create detailed pricing with proper per-day calculations
    return createDetailedPricing({
      basePricePerDay,
      totalDays,
      driverFeePerDay: driveOption === 'with-driver' ? DRIVER_FEE_PER_DAY : 0,
      discounts,
      extraCharges: [], // Can be extended based on business rules
    });
  };

  const validateBookingForm = () => {
    const errors = [];

    if (!destination.trim()) {
      errors.push('Destination is required');
    }

    if (!pickUpAddress) {
      errors.push('Pickup address is required');
    }

    if (!pickupTime) {
      errors.push('Pickup time is required');
    }

    if (!returnAddress) {
      errors.push('Return address is required');
    }

    if (!returnTime) {
      errors.push('Return time is required');
    }

    if (!user?.uid) {
      errors.push('Please sign in to make a booking');
    }

    if (differenceInCalendarDays(returnDate, pickupDate) < 1) {
      errors.push('Return date must be at least 1 day after pickup date');
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return false;
    }

    return true;
  };

  const handleBookNow = (car: Car) => {
    if (!validateBookingForm()) {
      return;
    }

    setSelectedCar(car);
    setIsConfirmationOpen(true);
  };

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Force-refresh: fetch fresh data and update session cache
      const carListings = await CarFirebaseService.getAllCars();
      const convertedCars = uniqueByVehicleName(
        uniqueByDocId(carListings.map(convertCarListingToCar))
      );
      setCars(convertedCars);
      sessionStorage.setItem(
        CARS_SESSION_CACHE_KEY,
        JSON.stringify({
          cars: convertedCars,
          lastUpdatedMs: convertedCars
            .map((c: any) => c.updatedDate?.getTime?.() || 0)
            .reduce((a: number, b: number) => Math.max(a, b), 0),
        })
      );
      toast.success(`Refreshed! Loaded ${convertedCars.length} vehicles`);
    } catch (err) {
      setError('Failed to refresh vehicles. Please try again.');
      toast.error('Failed to refresh vehicles');
    } finally {
      setLoading(false);
    }
  };

  const DrumRollTimePicker = ({
    selectedTime,
    onTimeChange,
    placeholder = '--:-- --',
  }: {
    selectedTime: string;
    onTimeChange: (time: string) => void;
    placeholder?: string;
  }) => {
    const parseTime = (timeStr: string) => {
      if (!timeStr) return { hour: '', minute: '', period: '' };
      const [time, period] = timeStr.split(' ');
      const [hour, minute] = time.split(':');
      return { hour, minute, period: period || '' };
    };

    const {
      hour: selectedHour,
      minute: selectedMinute,
      period: selectedPeriod,
    } = parseTime(selectedTime);

    // Temporary states for preview before confirming
    const [tempHour, setTempHour] = useState(selectedHour || '01');
    const [tempMinute, setTempMinute] = useState(selectedMinute || '00');
    const [tempPeriod, setTempPeriod] = useState(selectedPeriod || 'AM');
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirmTime = () => {
      if (tempHour && tempMinute && tempPeriod) {
        onTimeChange(`${tempHour}:${tempMinute} ${tempPeriod}`);
        setIsOpen(false);
      }
    };

    const handleCancel = () => {
      // Reset temp values to current selected values
      setTempHour(selectedHour || '01');
      setTempMinute(selectedMinute || '00');
      setTempPeriod(selectedPeriod || 'AM');
      setIsOpen(false);
    };

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedTime && 'text-muted-foreground'
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {selectedTime || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Hours Drum */}
            <div className="flex flex-col items-center border-r">
              <div className="text-xs font-medium text-center py-2 px-3 border-b w-full bg-muted">
                Hour
              </div>
              <ScrollArea className="h-48 w-16">
                <div className="p-1">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      className={cn(
                        'w-full p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground',
                        tempHour === hour && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => setTempHour(hour)}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Minutes Drum */}
            <div className="flex flex-col items-center border-r">
              <div className="text-xs font-medium text-center py-2 px-3 border-b w-full bg-muted">
                Min
              </div>
              <ScrollArea className="h-48 w-16">
                <div className="p-1">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      className={cn(
                        'w-full p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground',
                        tempMinute === minute && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => setTempMinute(minute)}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* AM/PM Drum */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-medium text-center py-2 px-3 border-b w-full bg-muted">
                Period
              </div>
              <ScrollArea className="h-48 w-16">
                <div className="p-1">
                  {periods.map((period) => (
                    <button
                      key={period}
                      className={cn(
                        'w-full p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground',
                        tempPeriod === period && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => setTempPeriod(period)}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 p-3 border-t">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" className="flex-1" onClick={handleConfirmTime}>
              Set Time
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="space-y-5">
      <Card title="Car Rental Booking">
        <div className="space-y-8">
          {/* Drive Option Selection */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Choose Your Driving Experience
              </Label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Self Drive Option */}
              <div
                className={cn(
                  'relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
                  driveOption === 'self-drive'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300'
                )}
                onClick={() => setDriveOption('self-drive')}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      driveOption === 'self-drive'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    {driveOption === 'self-drive' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-4c0-5.523 4.477-10 10-10s10 4.477 10 10a4 4 0 01-4 4z"
                        />
                      </svg>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Self Drive</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Drive the vehicle yourself with complete freedom
                    </p>
                  </div>
                </div>
              </div>

              {/* With Driver Option */}
              <div
                className={cn(
                  'relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
                  driveOption === 'with-driver'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20 ring-2 ring-green-200 dark:ring-green-800'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-green-300'
                )}
                onClick={() => setDriveOption('with-driver')}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      driveOption === 'with-driver'
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    {driveOption === 'with-driver' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        With Driver
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Professional driver included (+₱750/day)
                    </p>
                  </div>
                </div>
                {driveOption === 'with-driver' && (
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-xs font-medium">Licensed & Experienced Driver</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Destination */}
          <div>
            <Label
              htmlFor="destination"
              className="mb-3 block text-base font-semibold text-gray-800 dark:text-gray-200"
            >
              Destination <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="destination"
              placeholder="Indicate your farthest destination (e.g., Manila, Cebu, Davao, etc.)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={cn(
                'min-h-[100px] resize-none transition-all duration-200',
                destination
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-400 ring-1 ring-blue-200 dark:ring-blue-800'
                  : 'hover:border-blue-300 focus:border-blue-500'
              )}
              rows={4}
            />
          </div>

          {/* Pickup Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Pickup Details
              </h3>
            </div>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
              <div>
                <Label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
                  Pick up Address <span className="text-red-500">*</span>
                </Label>
                <Select value={pickUpAddress} onValueChange={setPickUpAddress}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup location" />
                  </SelectTrigger>
                  <SelectContent>
                    {addressOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
                  Pick up Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !pickupDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pickupDate ? format(pickupDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={pickupDate}
                      onSelect={(date) => setPickupDate(date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
                  Pick up Time <span className="text-red-500">*</span>
                </Label>
                <DrumRollTimePicker
                  selectedTime={pickupTime}
                  onTimeChange={setPickupTime}
                  placeholder="--:-- --"
                />
              </div>
            </div>
          </div>

          {/* Return Section */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Return Details
              </h3>
            </div>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
              <div>
                <Label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
                  Return Address <span className="text-red-500">*</span>
                </Label>
                <Select value={returnAddress} onValueChange={setReturnAddress}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select return location" />
                  </SelectTrigger>
                  <SelectContent>
                    {addressOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
                  Return Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !returnDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {returnDate ? format(returnDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={(date) => {
                        if (date) {
                          setReturnDate(date);
                        } else {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          setReturnDate(tomorrow);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
                  Return Time <span className="text-red-500">*</span>
                </Label>
                <DrumRollTimePicker
                  selectedTime={returnTime}
                  onTimeChange={setReturnTime}
                  placeholder="--:-- --"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Fleet Display Section */}
      <Card title="Available Vehicles">
        {loading ? (
          <div className="space-y-6">
            {/* Loading skeleton for filter */}
            <div className="flex gap-2 mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-20" />
              ))}
            </div>

            {/* Loading skeleton for car grid */}
            <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(380px,1fr))]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-center gap-4 py-4">
                      <Skeleton className="h-5 w-8" />
                      <Skeleton className="h-5 w-8" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 dark:text-red-400 mb-4">
              <p className="text-lg font-medium">⚠️ Error Loading Vehicles</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No vehicles available at the moment.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Please check back later or contact support.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Refresh Button */}
            <div className="flex justify-end">
              <Button onClick={handleRefreshData} variant="outline" size="sm" disabled={loading}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>

            <ErrorBoundary>
              <CarGrid
                cars={cars}
                onBookNow={handleBookNow}
                showFilter={true}
                pickupDate={pickupDate}
                returnDate={returnDate}
                driveOption={driveOption}
                defaultCategory="All"
              />
            </ErrorBoundary>
          </div>
        )}
      </Card>

      {/* Booking Confirmation Dialog */}
      {selectedCar && (
        <BookingConfirmationDialog
          isOpen={isConfirmationOpen}
          onClose={() => {
            setIsConfirmationOpen(false);
            setSelectedCar(null);
          }}
          car={selectedCar}
          bookingData={{
            destination,
            pickUpAddress,
            pickUpDate: pickupDate,
            pickUpTime: pickupTime,
            returnAddress,
            returnDate,
            returnTime,
            driveOption,
            driverPerDay: driveOption === 'with-driver' ? 750 : undefined,
          }}
          pricingDetails={calculatePricingDetails(selectedCar)}
        />
      )}
    </div>
  );
};

export default BookingPage;
