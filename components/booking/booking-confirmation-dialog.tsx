'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CalendarIcon,
  Clock,
  MapPin,
  Car as CarIcon,
  Users,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Car } from '@/components/fleet';
import { BookingData, BookingFirebaseService } from '@/lib/firebase-booking-service';
import {
  DetailedPriceBreakdown,
  DetailedPricingData,
} from '@/components/pricing/detailed-price-breakdown';
import { useUserStore } from '@/store';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';

export interface BookingFormData {
  destination: string;
  pickUpAddress: string;
  pickUpDate: Date;
  pickUpTime: string;
  returnAddress: string;
  returnDate: Date;
  returnTime: string;
  driveOption: 'self-drive' | 'with-driver';
  driverPerDay?: number; // Only used for 'with-driver' option
}

interface BookingConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car;
  bookingData: BookingFormData;
  pricingDetails: DetailedPricingData;
}

export const BookingConfirmationDialog = ({
  isOpen,
  onClose,
  car,
  bookingData,
  pricingDetails,
}: BookingConfirmationDialogProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleConfirmBooking = async () => {
    console.log('Starting booking confirmation process...');
    console.log('User:', user);

    if (!user?.uid) {
      console.error('User not authenticated');
      toast.error('Please sign in to make a booking');
      return;
    }

    // Validate required fields
    if (!bookingData.destination?.trim()) {
      toast.error('Destination is required');
      return;
    }

    if (!bookingData.pickUpAddress || !bookingData.returnAddress) {
      toast.error('Pickup and return addresses are required');
      return;
    }

    if (!bookingData.pickUpTime || !bookingData.returnTime) {
      toast.error('Pickup and return times are required');
      return;
    }

    setIsConfirming(true);

    try {
      console.log('Preparing booking data...');

      // Prepare booking data for Firebase (avoiding undefined values)
      const totalAmount = pricingDetails.finalTotal || 0;

      const baseBookingData = {
        renterId: user.uid,
        driveOption: bookingData.driveOption,
        destination: bookingData.destination.trim(),
        pickUpAddress: bookingData.pickUpAddress,
        pickUpDate: format(bookingData.pickUpDate, 'yyyy-MM-dd'),
        pickUpTime: bookingData.pickUpTime,
        returnAddress: bookingData.returnAddress,
        returnDate: format(bookingData.returnDate, 'yyyy-MM-dd'),
        returnTime: bookingData.returnTime,
        selectedVehicles: {
          vehicleUrl: car.image, // Using car image URL as vehicleUrl for better identification
          name: car.name,
          basePrice: parseInt(car.price.replace(/[^0-9]/g, '')) || 0,
          pricePerDay: parseInt(car.price.replace(/[^0-9]/g, '')) || 0,
          totalDuration: pricingDetails.totalDays,
          extraCharges: (pricingDetails.extraCharges || []).map((charge) => ({
            label: charge.label,
            type: charge.type,
            amount: charge.totalAmount,
          })),
          discounts: (pricingDetails.discounts || []).map((discount) => ({
            label: discount.label,
            type: discount.type,
            percent: discount.percent,
            amount: discount.totalAmount,
            applied: discount.applied,
          })),
          totalAmount: totalAmount,
        },
        payment: {
          totalAmount: totalAmount,
          paid: 0, // No payment made yet
          balance: totalAmount,
          status: 'unpaid' as const,
        },
        extensions: [], // Initialize empty extensions array
        status: 'processing' as const,
      };

      // Only add driverPerDay if it's a with-driver booking
      const firebaseBookingData: Omit<BookingData, 'createdAt' | 'updatedAt'> =
        bookingData.driveOption === 'with-driver'
          ? {
              ...baseBookingData,
              driverPerDay: bookingData.driverPerDay || 750,
            }
          : baseBookingData;

      console.log('Booking data prepared:', firebaseBookingData);

      // Save to Firebase
      console.log('Saving to Firebase...');
      const bookingId = await BookingFirebaseService.createBooking(firebaseBookingData);

      console.log('Booking created successfully with ID:', bookingId);
      toast.success('Booking submitted successfully!');
      onClose();

      // Get current language from pathname
      const currentLang = pathname.split('/')[1] || 'en';

      // Redirect to completion page with language parameter
      router.push(`/${currentLang}/booking-complete?bookingId=${bookingId}`);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
      });

      // More specific error messages
      let errorMessage = 'Failed to submit booking. Please try again.';

      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please ensure you are signed in with proper access.';
      } else if (error.code === 'network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('auth')) {
        errorMessage = 'Authentication error. Please sign in again.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      }

      toast.error(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return format(date, 'PPP'); // Long format like "December 25, 2023"
  };

  const formatTime = (time: string) => {
    return time || '--:-- --';
  };

  const getAddressLabel = (address: string) => {
    const addressLabels: Record<string, string> = {
      'nacs-garage': 'NACS Car Rental Garage',
      'pagadian-airport': 'Pagadian Airport',
      'pagadian-area': 'Pagadian Area',
    };
    return addressLabels[address] || address;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] max-w-[1200px] max-h-[90vh] overflow-y-auto"
        style={{ width: '95vw', maxWidth: '1200px' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Confirm Your Booking
          </DialogTitle>
          <DialogDescription>
            Please review your booking details before confirming. Once confirmed, you'll receive a
            confirmation email and can track your booking status.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Vehicle Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CarIcon className="h-5 w-5" />
                Selected Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-32 sm:h-24 w-full h-auto relative overflow-hidden rounded-lg">
                  <img src={car.image} alt={car.name} className="w-full h-full object-contain" />
                  {car.isPromo && (
                    <Badge className="absolute top-1 left-1 bg-red-500 hover:bg-red-600 text-xs px-1 py-0">
                      PROMO
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">{car.name}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {car.passengers} passengers
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {car.bags} bags
                    </div>
                    <Badge variant="outline">{car.transmission}</Badge>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Category:</span> {car.category}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Drive Option</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={bookingData.driveOption === 'self-drive' ? 'outline' : 'soft'}>
                      {bookingData.driveOption === 'self-drive' ? 'Self Drive' : 'With Driver'}
                    </Badge>
                    {bookingData.driveOption === 'with-driver' && (
                      <span className="text-sm text-green-600">
                        +₱{bookingData.driverPerDay || 750}/day
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Destination</label>
                  <p className="mt-1">{bookingData.destination}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="mt-1">
                    {pricingDetails.totalDays} day{pricingDetails.totalDays !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Pickup Details */}
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Pickup
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div>{getAddressLabel(bookingData.pickUpAddress)}</div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(bookingData.pickUpDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(bookingData.pickUpTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Return Details */}
                <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Return
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div>{getAddressLabel(bookingData.returnAddress)}</div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(bookingData.returnDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(bookingData.returnTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Price Breakdown */}
            <DetailedPriceBreakdown
              pricing={pricingDetails}
              vehicleName={car.name}
              showHeader={true}
              compact={false}
            />
          </div>

          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Important Information
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                    <li>Your booking request will be processed within 24 hours</li>
                    <li>You will receive confirmation via email once approved</li>
                    <li>Payment will be collected upon vehicle pickup</li>
                    <li>Valid driver's license required for all bookings</li>
                    <li>Additional security deposit may be required</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Review Again
          </Button>
          <Button onClick={handleConfirmBooking} disabled={isConfirming} className="min-w-32">
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
