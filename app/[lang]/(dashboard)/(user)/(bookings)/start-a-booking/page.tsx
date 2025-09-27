'use client';

import { useState, useMemo, useCallback } from 'react';
import Card from '@/components/ui/card-snippet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInCalendarDays } from 'date-fns';
import { CarGrid, Car } from '@/components/fleet';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/error-boundary';
import dynamic from 'next/dynamic';
import { useUserStore } from '@/store';
import { calculateBookingPricing, PricingCalculationResult } from '@/lib/pricing-utils';
import { DetailedPricingData } from '@/components/pricing/detailed-price-breakdown';
import { createDiscountBreakdown } from '@/lib/dynamic-pricing';

// Import our new components
import {
  DriveOptionSelector,
  ZDSDiscountToggle,
  DestinationInput,
  PickupDetailsSection,
  ReturnDetailsSection,
  BookingFormData,
} from '@/components/booking';

// Import our custom hooks
import { useBookingValidation } from '@/hooks/use-booking-validation';
import { useCarData } from '@/hooks/use-car-data';

// Dynamic import for performance
const BookingConfirmationDialog = dynamic(
  () =>
    import('@/components/booking/booking-confirmation-dialog').then((mod) => ({
      default: mod.BookingConfirmationDialog,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

// Constants
const DRIVER_FEE_PER_DAY = 750;

const BookingPage = () => {
  // Form state
  const [destination, setDestination] = useState('');
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
  const [returnAddress, setReturnAddress] = useState('nacs-garage-return');
  const [pickupPagadianDetails, setPickupPagadianDetails] = useState('');
  const [returnPagadianDetails, setReturnPagadianDetails] = useState('');
  const [withInZDS, setWithInZDS] = useState(false);

  // Dialog state
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  // Custom hooks
  const { cars, loading, error } = useCarData();
  const { validationErrors, hasFieldError, clearFieldError, validateBookingForm } =
    useBookingValidation();
  const { user } = useUserStore();

  // Convert PricingCalculationResult to DetailedPricingData format
  const convertToDetailedPricingData = useCallback(
    (
      result: PricingCalculationResult,
      totalDays: number,
      basePricePerDay: number,
      discounts: any[]
    ): DetailedPricingData => {
      const driverFeePerDay = driveOption === 'with-driver' ? DRIVER_FEE_PER_DAY : 0;
      const driverSubtotal = driverFeePerDay * totalDays;

      // Convert discounts to DetailedPricingData format, excluding ZDS discount
      const convertedDiscounts = discounts
        .filter((d) => d.label !== 'Within Zamboanga Del Sur')
        .map((discount) => ({
          label: discount.label,
          type: discount.type,
          percent: discount.percent,
          amountPerDay: discount.amount / totalDays,
          totalAmount: discount.amount,
          applied: discount.applied,
        }));

      // Add ZDS discount if applicable
      if (result.zdsDiscount > 0) {
        const zdsAmountPerDay = result.zdsDiscount / totalDays;
        const zdsPercentage = (zdsAmountPerDay / basePricePerDay) * 100;
        convertedDiscounts.push({
          label: 'Within Zamboanga Del Sur',
          type: 'zds_discount',
          percent: zdsPercentage,
          amountPerDay: zdsAmountPerDay,
          totalAmount: result.zdsDiscount,
          applied: true,
        });
      }

      const subtotalBeforeDiscounts =
        basePricePerDay * totalDays + result.driverCost + result.extraChargesTotal;

      return {
        basePricePerDay: basePricePerDay,
        totalDays,
        baseSubtotal: basePricePerDay * totalDays,
        driverFeePerDay: driverFeePerDay > 0 ? driverFeePerDay : undefined,
        driverSubtotal: driverFeePerDay > 0 ? driverSubtotal : undefined,
        discounts: convertedDiscounts,
        extraCharges: [],
        subtotalBeforeDiscounts,
        totalDiscounts: result.discountsTotal + result.zdsDiscount,
        totalSavings: result.discountsTotal + result.zdsDiscount,
        finalTotal: result.finalTotal,
      };
    },
    [driveOption]
  );

  const calculatePricingDetails = useCallback(
    (car: Car): DetailedPricingData => {
      const totalDays = Math.max(1, differenceInCalendarDays(returnDate, pickupDate));
      const basePricePerDay = parseInt(car.price.replace(/[^0-9]/g, ''));
      const isVerifiedUser = user?.isVerified ?? false;
      const driverFeePerDay = driveOption === 'with-driver' ? DRIVER_FEE_PER_DAY : 0;

      // Use dynamic pricing system to get discount breakdown
      const discountBreakdown = createDiscountBreakdown(
        basePricePerDay,
        totalDays,
        car.isPromo,
        isVerifiedUser,
        withInZDS
      );

      // Convert car card discounts to new pricing format
      const discounts = discountBreakdown.map((discount) => ({
        label: discount.name,
        type: discount.type,
        percent: discount.percentage,
        amount: discount.amount * totalDays,
        applied: true,
      }));

      // Check if ZDS discount is present in the discounts
      const hasZDSDiscount = discounts.some((d) => d.label === 'Within Zamboanga Del Sur');

      // Use new pricing calculation function
      const result = calculateBookingPricing({
        basePrice: basePricePerDay,
        totalDuration: totalDays,
        withInZDS: hasZDSDiscount || withInZDS,
        isPromo: car.isPromo,
        driveOption,
        driverPerDay: driverFeePerDay,
        discounts: discounts.filter((d) => d.label !== 'Within Zamboanga Del Sur'),
        extraCharges: [],
      });

      return convertToDetailedPricingData(result, totalDays, basePricePerDay, discounts);
    },
    [returnDate, pickupDate, user?.isVerified, driveOption, withInZDS, convertToDetailedPricingData]
  );

  // Pre-calculate pricing details for selected car to avoid conditional hooks
  const selectedCarPricingDetails = useMemo(() => {
    if (!selectedCar) return null;
    return calculatePricingDetails(selectedCar);
  }, [selectedCar, calculatePricingDetails]);

  const handleBookNow = (car: Car) => {
    const isValid = validateBookingForm({
      destination,
      pickUpAddress,
      pickupPagadianDetails,
      pickupTime,
      returnAddress,
      returnPagadianDetails,
      returnTime,
      pickupDate,
      returnDate,
      userUid: user?.uid,
    });

    if (!isValid) return;

    setSelectedCar(car);
    setIsConfirmationOpen(true);
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-20" />
        ))}
      </div>
      <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(380px,1fr))]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
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
  );

  const ErrorDisplay = () => (
    <div className="text-center py-12">
      <div className="text-red-500 dark:text-red-400 mb-4">
        <p className="text-lg font-medium">⚠️ Error Loading Vehicles</p>
        <p className="text-sm">{error}</p>
      </div>
      <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
        Try Again
      </Button>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <p className="text-gray-500 dark:text-gray-400 text-lg">
        No vehicles available at the moment.
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
        Please check back later or contact support.
      </p>
    </div>
  );

  return (
    <div className="space-y-5">
      <Card title="Car Rental Booking">
        <div className="space-y-8">
          {/* Drive Option Selection */}
          <DriveOptionSelector driveOption={driveOption} onDriveOptionChange={setDriveOption} />

          {/* Within Zamboanga Del Sur Option */}
          <ZDSDiscountToggle withInZDS={withInZDS} onWithInZDSChange={setWithInZDS} />

          {/* Destination */}
          <DestinationInput
            destination={destination}
            onDestinationChange={setDestination}
            hasError={hasFieldError('destination')}
            onErrorClear={() => clearFieldError('destination')}
          />

          {/* Pickup Section */}
          <PickupDetailsSection
            pickUpAddress={pickUpAddress}
            onPickUpAddressChange={setPickUpAddress}
            pickupPagadianDetails={pickupPagadianDetails}
            onPickupPagadianDetailsChange={setPickupPagadianDetails}
            pickupDate={pickupDate}
            onPickupDateChange={setPickupDate}
            pickupTime={pickupTime}
            onPickupTimeChange={setPickupTime}
            validationErrors={validationErrors}
            onErrorClear={clearFieldError}
          />

          {/* Return Section */}
          <ReturnDetailsSection
            returnAddress={returnAddress}
            onReturnAddressChange={setReturnAddress}
            returnPagadianDetails={returnPagadianDetails}
            onReturnPagadianDetailsChange={setReturnPagadianDetails}
            returnDate={returnDate}
            onReturnDateChange={setReturnDate}
            returnTime={returnTime}
            onReturnTimeChange={setReturnTime}
            validationErrors={validationErrors}
            onErrorClear={clearFieldError}
          />
        </div>
      </Card>

      {/* Fleet Display Section */}
      <Card title="Available Vehicles">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorDisplay />
        ) : cars.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            <ErrorBoundary>
              <CarGrid
                cars={cars}
                onBookNow={handleBookNow}
                showFilter={true}
                pickupDate={pickupDate}
                returnDate={returnDate}
                driveOption={driveOption}
                defaultCategory="All"
                withInZDS={withInZDS}
              />
            </ErrorBoundary>
          </div>
        )}
      </Card>

      {/* Booking Confirmation Dialog */}
      {selectedCar && selectedCarPricingDetails && (
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
            withInZDS,
            pickupPagadianDetails:
              pickUpAddress === 'pagadian-area' ? pickupPagadianDetails : undefined,
            returnPagadianDetails:
              returnAddress === 'pagadian-area' ? returnPagadianDetails : undefined,
          }}
          pricingDetails={selectedCarPricingDetails}
        />
      )}
    </div>
  );
};

export default BookingPage;
