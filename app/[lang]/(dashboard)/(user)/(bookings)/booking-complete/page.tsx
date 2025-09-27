'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  MessageCircle,
  Calendar,
  Car as CarIcon,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
  Home,
} from 'lucide-react';
import { BookingFirebaseService, BookingData } from '@/lib/firebase-booking-service';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUserStore } from '@/store';

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'PPP');
    } catch {
      return dateString;
    }
  };

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

  const getAddressLabel = (address: string, pagadianDetails?: string) => {
    const addressLabels: Record<string, string> = {
      'nacs-garage': 'NACS Car Rental Garage',
      'nacs-garage-return': 'NACS Car Rental Garage',
      'pagadian-airport': 'Pagadian Airport',
      'pagadian-area': 'Pagadian City Area',
    };

    const baseLabel = addressLabels[address] || address;

    // If it's Pagadian Area and we have specific details, append them
    if (address === 'pagadian-area' && pagadianDetails?.trim()) {
      return `${baseLabel} - ${pagadianDetails}`;
    }

    return baseLabel;
  };

  const getLocationIcon = (address: string) => {
    switch (address) {
      case 'nacs-garage':
      case 'nacs-garage-return':
        return '🏢';
      case 'pagadian-airport':
        return '✈️';
      case 'pagadian-area':
        return '🏙️';
      default:
        return '📍';
    }
  };

  const handleChatSupport = () => {
    // Open chat widget or redirect to support page
    // You can integrate with your preferred chat service (Intercom, Zendesk, etc.)
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
      <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
                Booking Successfully Submitted!
              </h1>
              <p className="text-green-600 dark:text-green-300 mt-2">
                Your car rental request has been received and is being processed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Booking ID:</span>
              <Badge variant="outline" className="font-mono">
                {bookingId}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                🗺️ Trip Overview
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="text-blue-600 dark:text-blue-300 font-medium">
                    Destination
                  </label>
                  <p className="mt-1 font-semibold text-blue-800 dark:text-blue-100">
                    {booking.bookingDetails.destination}
                  </p>
                </div>
                <div>
                  <label className="text-blue-600 dark:text-blue-300 font-medium">Duration</label>
                  <p className="mt-1 font-semibold text-blue-800 dark:text-blue-100">
                    {booking.selectedVehicles.totalDuration} day
                    {booking.selectedVehicles.totalDuration !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <label className="text-blue-600 dark:text-blue-300 font-medium">
                    Service Type
                  </label>
                  <p className="mt-1 font-semibold text-blue-800 dark:text-blue-100">
                    {booking.bookingDetails.driveOption === 'self-drive'
                      ? 'Self Drive'
                      : 'With Driver'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Location & Schedule Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  📍 Pickup & Return Schedule
                </h4>

                {/* Pickup */}
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h5 className="font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                    <span className="text-lg">
                      {getLocationIcon(booking.bookingDetails.pickUpAddress)}
                    </span>
                    Pickup Location & Time
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-100">
                          {getAddressLabel(
                            booking.bookingDetails.pickUpAddress,
                            booking.bookingDetails.pickupPagadianDetails
                          )}
                        </p>
                        {booking.bookingDetails.pickUpAddress === 'nacs-garage' && (
                          <p className="text-green-600 dark:text-green-300 text-xs mt-1">
                            🏢 Self pickup at our main garage facility
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-6">
                      <span className="flex items-center gap-1 text-green-700 dark:text-green-300">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">
                          {formatDate(booking.bookingDetails.pickUpDate)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-green-700 dark:text-green-300">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">{booking.bookingDetails.pickUpTime}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Return */}
                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h5 className="font-medium text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
                    <span className="text-lg">
                      {getLocationIcon(booking.bookingDetails.returnAddress)}
                    </span>
                    Return Location & Time
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-orange-800 dark:text-orange-100">
                          {getAddressLabel(
                            booking.bookingDetails.returnAddress,
                            booking.bookingDetails.returnPagadianDetails
                          )}
                        </p>
                        {booking.bookingDetails.returnAddress === 'nacs-garage-return' && (
                          <p className="text-orange-600 dark:text-orange-300 text-xs mt-1">
                            🏢 Return directly to our main garage facility
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-6">
                      <span className="flex items-center gap-1 text-orange-700 dark:text-orange-300">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">
                          {formatDate(booking.bookingDetails.returnDate)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-orange-700 dark:text-orange-300">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">{booking.bookingDetails.returnTime}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Price Summary */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  💰 Price Breakdown
                </h4>

                {/* Base Vehicle Rate */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                    🚗 Vehicle Rate
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Rate per day:</span>
                      <span className="font-medium">
                        {formatCurrency(booking.selectedVehicles.pricePerDay)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="font-medium">
                        {booking.selectedVehicles.totalDuration} day
                        {booking.selectedVehicles.totalDuration !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Show ZDS discount if applied */}
                    {booking.bookingDetails.withInZDS && (
                      <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded border border-green-300 dark:border-green-700">
                        <div className="flex justify-between items-center text-green-700 dark:text-green-300">
                          <span className="text-xs font-medium">🏡 ZDS Local Discount:</span>
                          <span className="font-bold">
                            -
                            {formatCurrency(
                              // Check if car name contains promo indicators for dynamic ZDS amount
                              booking.selectedVehicles.name.includes('🔥') ||
                                booking.selectedVehicles.name.toLowerCase().includes('promo')
                                ? 200
                                : 100
                            )}
                            /day
                          </span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Special rate for Zamboanga Del Sur destinations
                        </p>
                      </div>
                    )}

                    <Separator className="my-2" />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Vehicle Subtotal:</span>
                      <span className="text-lg">
                        {formatCurrency(
                          booking.selectedVehicles.pricePerDay *
                            booking.selectedVehicles.totalDuration
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver Service (if applicable) */}
                {booking.bookingDetails.driveOption === 'with-driver' &&
                  booking.bookingDetails.driverPerDay && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2 border border-blue-200 dark:border-blue-800">
                      <h5 className="font-semibold text-blue-700 dark:text-blue-300 text-sm">
                        👨‍✈️ Driver Service
                      </h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between items-center text-blue-700 dark:text-blue-300">
                          <span>Driver fee per day:</span>
                          <span className="font-medium">
                            {formatCurrency(booking.bookingDetails.driverPerDay)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-blue-700 dark:text-blue-300">
                          <span>Duration:</span>
                          <span className="font-medium">
                            {booking.selectedVehicles.totalDuration} day
                            {booking.selectedVehicles.totalDuration !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center font-semibold text-blue-700 dark:text-blue-300">
                          <span>Driver Subtotal:</span>
                          <span>
                            {formatCurrency(
                              booking.bookingDetails.driverPerDay *
                                booking.selectedVehicles.totalDuration
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Applied Discounts */}
                {booking.selectedVehicles.discounts &&
                  booking.selectedVehicles.discounts.filter(
                    (d) => d.applied && !d.label.toLowerCase().includes('zamboanga')
                  ).length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-2 border border-green-200 dark:border-green-800">
                      <h5 className="font-semibold text-green-700 dark:text-green-300 text-sm">
                        🎉 Applied Discounts
                      </h5>
                      {booking.selectedVehicles.discounts
                        .filter((d) => d.applied && !d.label.toLowerCase().includes('zamboanga'))
                        .map((discount, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm text-green-700 dark:text-green-300"
                          >
                            <span>
                              {discount.label} ({discount.percent.toFixed(1)}% off)
                            </span>
                            <span className="font-medium">-{formatCurrency(discount.amount)}</span>
                          </div>
                        ))}
                    </div>
                  )}

                {/* Extra Charges */}
                {booking.selectedVehicles.extraCharges &&
                  booking.selectedVehicles.extraCharges.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 space-y-2 border border-orange-200 dark:border-orange-800">
                      <h5 className="font-semibold text-orange-700 dark:text-orange-300 text-sm">
                        📋 Additional Charges
                      </h5>
                      {booking.selectedVehicles.extraCharges.map((charge, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm text-orange-700 dark:text-orange-300"
                        >
                          <span>{charge.label}</span>
                          <span className="font-medium">+{formatCurrency(charge.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Final Total */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-blue-100 text-sm">Total Amount Due</span>
                      <div className="font-bold text-2xl">
                        {formatCurrency(booking.selectedVehicles.totalAmount)}
                      </div>
                      <div className="text-blue-200 text-sm mt-1">
                        💡 Payment collected at pickup
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-200 text-sm">
                        {booking.selectedVehicles.totalDuration} day
                        {booking.selectedVehicles.totalDuration !== 1 ? 's' : ''}
                      </div>
                      <div className="font-semibold text-lg">
                        {formatCurrency(
                          booking.selectedVehicles.totalAmount /
                            booking.selectedVehicles.totalDuration
                        )}
                        /day avg
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Review & Approval</p>
                  <p className="text-blue-600 dark:text-blue-300 text-sm">
                    Our team will promptly review your booking request, typically within 30 minutes
                    to 2 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Confirmation</p>
                  <p className="text-blue-600 dark:text-blue-300 text-sm">
                    You will receive a text message or phone call with the vehicle details and
                    pickup instructions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Vehicle Pickup</p>
                  <p className="text-blue-600 dark:text-blue-300 text-sm">
                    Present your valid driver's license and make payment at pickup location
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
