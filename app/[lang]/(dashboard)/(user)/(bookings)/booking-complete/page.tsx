'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Car as CarIcon,
  ArrowRight,
  Loader2,
  AlertCircle,
  Home,
} from 'lucide-react';
import { BookingFirebaseService, BookingData } from '@/lib/firebase-booking-service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUserStore } from '@/store';

// Import our new components
import {
  SuccessHeader,
  TripOverview,
  LocationDetails,
  PriceBreakdown,
  NextSteps,
} from '@/components/booking-complete';

// Cache for booking details to avoid unnecessary fetches
const bookingDetailsCache = new Map<string, { data: BookingData; timestamp: number }>();
const BOOKING_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

const BookingCompletePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { user } = useUserStore();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError('No booking ID provided');
        setIsLoading(false);
        return;
      }

      // Check cache first
      const cached = bookingDetailsCache.get(bookingId);
      const now = Date.now();

      if (cached && now - cached.timestamp < BOOKING_CACHE_DURATION) {
        setBooking(cached.data);
        setError(null);
        setIsLoading(false);
        return;
      }

      try {
        const bookingData = await BookingFirebaseService.getBookingById(bookingId);
        if (bookingData) {
          // Cache the results
          bookingDetailsCache.set(bookingId, {
            data: bookingData,
            timestamp: now,
          });
          setBooking(bookingData);
        } else {
          setError('Booking not found');
        }
      } catch (error) {
        setError('Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const getStatusBadgeColor = (status: BookingData['bookingDetails']['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'reserved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleChatSupport = () => {
    toast.info('Chat feature will be available soon!');
  };

  const handleViewActiveRentals = () => {
    router.push('/active-rentals');
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Loading booking details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-8 w-8 mx-auto text-red-600" />
              <p className="text-gray-600">{error || 'Booking not found'}</p>
              <Button onClick={handleGoHome} variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Success Header */}
      <SuccessHeader bookingId={bookingId!} />

      {/* Booking Details */}
      <div className="grid gap-6 mb-8">
        {/* Vehicle and Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CarIcon className="h-5 w-5" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">{booking.selectedVehicles.name}</h3>
                <p className="text-gray-600">
                  {booking.bookingDetails.driveOption === 'self-drive'
                    ? 'Self Drive'
                    : 'With Driver'}
                  {booking.bookingDetails.driveOption === 'with-driver' &&
                    booking.bookingDetails.driverPerDay && (
                      <span className="text-green-600 ml-2">
                        (+₱{booking.bookingDetails.driverPerDay}/day)
                      </span>
                    )}
                </p>
              </div>
              <Badge
                className={cn('capitalize', getStatusBadgeColor(booking.bookingDetails.status))}
              >
                {booking.bookingDetails.status}
              </Badge>
            </div>

            {/* Trip Overview Section */}
            <TripOverview
              destination={booking.bookingDetails.destination}
              totalDuration={booking.selectedVehicles.totalDuration}
              driveOption={booking.bookingDetails.driveOption}
            />

            <div className="grid md:grid-cols-2 gap-6">
              {/* Location & Schedule Details */}
              <LocationDetails
                pickUpAddress={booking.bookingDetails.pickUpAddress}
                pickUpDate={booking.bookingDetails.pickUpDate}
                pickUpTime={booking.bookingDetails.pickUpTime}
                returnAddress={booking.bookingDetails.returnAddress}
                returnDate={booking.bookingDetails.returnDate}
                returnTime={booking.bookingDetails.returnTime}
                pickupPagadianDetails={booking.bookingDetails.pickupPagadianDetails}
                returnPagadianDetails={booking.bookingDetails.returnPagadianDetails}
              />

              {/* Enhanced Price Summary */}
              <PriceBreakdown
                pricePerDay={booking.selectedVehicles.pricePerDay}
                totalDuration={booking.selectedVehicles.totalDuration}
                driveOption={booking.bookingDetails.driveOption}
                driverPerDay={booking.bookingDetails.driverPerDay}
                discounts={booking.selectedVehicles.discounts}
                extraCharges={booking.selectedVehicles.extraCharges}
                totalAmount={booking.selectedVehicles.totalAmount}
              />
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <NextSteps />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={handleChatSupport} variant="outline" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat with Support
        </Button>

        <Button onClick={handleViewActiveRentals} className="flex items-center gap-2">
          View Active Rentals
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Footer Message */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">Thank you for choosing NACS Car Rental! 🚗</p>
            <p className="text-sm">
              For any questions or concerns, feel free to contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCompletePage;
