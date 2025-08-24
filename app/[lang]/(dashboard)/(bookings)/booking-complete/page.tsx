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

      try {
        const bookingData = await BookingFirebaseService.getBookingById(bookingId);
        if (bookingData) {
          setBooking(bookingData);
        } else {
          setError('Booking not found');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
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

  const getStatusBadgeColor = (status: BookingData['status']) => {
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

  const getAddressLabel = (address: string) => {
    const addressLabels: Record<string, string> = {
      'nacs-garage': 'NACS Car Rental Garage',
      'pagadian-airport': 'Pagadian Airport',
      'pagadian-area': 'Pagadian Area',
    };
    return addressLabels[address] || address;
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
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{booking.selectedVehicles.name}</h3>
                <p className="text-gray-600">
                  {booking.driveOption === 'self-drive' ? 'Self Drive' : 'With Driver'}
                </p>
              </div>
              <Badge className={cn('capitalize', getStatusBadgeColor(booking.status))}>
                {booking.status}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Trip Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Destination</label>
                  <p className="mt-1">{booking.destination}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="mt-1">
                    {booking.selectedVehicles.totalDuration} day
                    {booking.selectedVehicles.totalDuration !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Pickup */}
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Pickup
                  </h4>
                  <div className="text-sm space-y-1">
                    <div>{getAddressLabel(booking.pickUpAddress)}</div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(booking.pickUpDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.pickUpTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Return */}
                <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Return
                  </h4>
                  <div className="text-sm space-y-1">
                    <div>{getAddressLabel(booking.returnAddress)}</div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(booking.returnDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.returnTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Price Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Price</span>
                    <span>{formatCurrency(booking.selectedVehicles.basePrice)}</span>
                  </div>

                  {booking.selectedVehicles.discounts
                    .filter(d => d.applied)
                    .map((discount, index) => (
                      <div key={index} className="flex justify-between text-sm text-green-600">
                        <span>{discount.label}</span>
                        <span>-{formatCurrency(discount.amount)}</span>
                      </div>
                    ))}

                  {booking.selectedVehicles.extraCharges.map((charge, index) => (
                    <div key={index} className="flex justify-between text-sm text-orange-600">
                      <span>{charge.label}</span>
                      <span>+{formatCurrency(charge.amount)}</span>
                    </div>
                  ))}

                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span>{formatCurrency(booking.selectedVehicles.totalAmount)}</span>
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
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Review & Approval
                  </p>
                  <p className="text-blue-600 dark:text-blue-300 text-sm">
                    Our team will promptly review your booking request, typically within 30 minutes to 2 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Confirmation
                  </p>
                  <p className="text-blue-600 dark:text-blue-300 text-sm">
                    You will receive a text message or phone call with the vehicle details and pickup instructions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Vehicle Pickup
                  </p>
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
        <Button
          onClick={handleChatSupport}
          variant="outline"
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Chat with Support
        </Button>

        <Button
          onClick={handleViewActiveRentals}
          className="flex items-center gap-2"
        >
          View Active Rentals
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Footer Message */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              Thank you for choosing NACS Car Rental! 🚗
            </p>
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