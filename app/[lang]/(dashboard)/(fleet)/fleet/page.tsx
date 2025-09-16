'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CarGrid, Car } from '@/components/fleet';
import { CarFirebaseService } from '@/lib/firebase-car-service';
import { CarListing } from '@/data/car-listings-data';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/error-boundary';

// Cache configuration
const FLEET_CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const fleetCarsCache = new Map<string, { data: Car[]; timestamp: number }>();

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
    category: carListing.category,
    passengers: carListing.passengers,
    bags: carListing.bags,
    transmission: carListing.transmission,
    features: features,
  };
};

const FleetPage = () => {
  const router = useRouter();
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

  // Firebase data state
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cars from Firebase on component mount
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cacheKey = 'fleet_cars';
        const cached = fleetCarsCache.get(cacheKey);
        const now = Date.now();

        if (cached && now - cached.timestamp < FLEET_CACHE_DURATION) {
          setCars(cached.data);
          setLoading(false);
          return;
        }

        const carListings = await CarFirebaseService.getAllCars();
        const convertedCars = carListings.map(convertCarListingToCar);

        // Cache the results
        fleetCarsCache.set(cacheKey, {
          data: convertedCars,
          timestamp: now,
        });

        setCars(convertedCars);
        toast.success(`Loaded ${convertedCars.length} vehicles`);
      } catch (err) {
        setError('Failed to load vehicles. Please try again.');
        toast.error('Failed to load vehicles');
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const addressOptions = [
    { value: 'nacs-garage', label: 'Self Pick Up @ NACS Car Rental Garage' },
    { value: 'pagadian-airport', label: 'Pagadian Airport' },
    { value: 'pagadian-area', label: 'Pagadian Area' },
  ];

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '10', '20', '30', '40', '50'];
  const periods = ['AM', 'PM'];

  const handleBookNow = (car: Car) => {
    // Navigate to booking page with selected car
    router.push('/start-a-booking');
  };

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear cache and fetch fresh data
      const cacheKey = 'fleet_cars';
      fleetCarsCache.delete(cacheKey);

      const carListings = await CarFirebaseService.getAllCars();
      const convertedCars = carListings.map(convertCarListingToCar);

      // Update cache with fresh data
      fleetCarsCache.set(cacheKey, {
        data: convertedCars,
        timestamp: Date.now(),
      });

      setCars(convertedCars);
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
    className = '',
  }: {
    selectedTime: string;
    onTimeChange: (time: string) => void;
    placeholder?: string;
    className?: string;
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
              !selectedTime && 'text-muted-foreground',
              className
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
                <Select>
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
                <Select>
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
    </div>
  );
};

export default FleetPage;
