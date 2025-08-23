'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Car as CarIcon,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  User,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { BookingFirebaseService, BookingData } from '@/lib/firebase-booking-service';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUserStore } from '@/store';
import { useRouter } from 'next/navigation';

const ActiveRentalsPage = () => {
  const router = useRouter();
  const { user } = useUserStore();
  
  const [activeBookings, setActiveBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveBookings = async () => {
      if (!user?.uid) {
        setError('Please sign in to view your bookings');
        setIsLoading(false);
        return;
      }

      try {
        const bookings = await BookingFirebaseService.getActiveBookings(user.uid);
        setActiveBookings(bookings);
      } catch (error) {
        console.error('Error fetching active bookings:', error);
        setError('Failed to load your active bookings');
        toast.error('Failed to load active bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveBookings();
  }, [user?.uid]);

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
      return format(date, 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeColor = (status: BookingData['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
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

  const getStatusMessage = (booking: BookingData) => {
    const today = new Date();
    const pickupDate = parseISO(booking.pickUpDate);
    const returnDate = parseISO(booking.returnDate);

    if (booking.status === 'processing') {
      return {
        message: 'Your booking is being reviewed',
        color: 'text-yellow-600',
        icon: <Clock className="h-4 w-4" />
      };
    }

    if (booking.status === 'approved') {
      if (isBefore(today, pickupDate)) {
        return {
          message: 'Booking confirmed - Prepare for pickup',
          color: 'text-green-600',
          icon: <Calendar className="h-4 w-4" />
        };
      } else {
        return {
          message: 'Ready for pickup',
          color: 'text-blue-600',
          icon: <CarIcon className="h-4 w-4" />
        };
      }
    }

    if (booking.status === 'ongoing') {
      if (isAfter(today, returnDate)) {
        return {
          message: 'Return overdue - Please contact us',
          color: 'text-red-600',
          icon: <AlertCircle className="h-4 w-4" />
        };
      } else {
        return {
          message: 'Enjoy your trip!',
          color: 'text-blue-600',
          icon: <CarIcon className="h-4 w-4" />
        };
      }
    }

    return {
      message: 'Status updated',
      color: 'text-gray-600',
      icon: <Clock className="h-4 w-4" />
    };
  };

  const handleChatSupport = () => {
    toast.info('Chat feature will be available soon!');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Loading your active rentals...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-8 w-8 mx-auto text-red-600" />
              <p className="text-gray-600">{error}</p>
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Active Rentals
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your current and upcoming car rentals
        </p>
      </div>

      {/* Active Bookings */}
      {activeBookings.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Active Rentals
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have any active or upcoming rentals at the moment.
            </p>
            <Button onClick={() => router.push('/start-a-booking')}>
              Start a New Booking
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeBookings.map((booking, index) => {
            const statusInfo = getStatusMessage(booking);
            
            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <CarIcon className="h-5 w-5" />
                        {booking.selectedVehicles.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={cn('capitalize', getStatusBadgeColor(booking.status))}>
                          {booking.status}
                        </Badge>
                        <div className={cn('flex items-center gap-1 text-sm', statusInfo.color)}>
                          {statusInfo.icon}
                          {statusInfo.message}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-xl font-bold">{formatCurrency(booking.selectedVehicles.totalAmount)}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Trip Details */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Drive Option</label>
                        <p className="mt-1 capitalize">{booking.driveOption.replace('-', ' ')}</p>
                      </div>
                      
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
                    </div>

                    {/* Pickup & Return */}
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Pickup
                        </h4>
                        <div className="text-sm space-y-1">
                          <div>{getAddressLabel(booking.pickUpAddress)}</div>
                          <div className="flex items-center gap-3">
                            <span>{formatDate(booking.pickUpDate)}</span>
                            <span>{booking.pickUpTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                        <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Return
                        </h4>
                        <div className="text-sm space-y-1">
                          <div>{getAddressLabel(booking.returnAddress)}</div>
                          <div className="flex items-center gap-3">
                            <span>{formatDate(booking.returnDate)}</span>
                            <span>{booking.returnTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Details */}
                    <div className="space-y-4">
                      {booking.assignedVehicle ? (
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                            Assigned Vehicle
                          </h4>
                          <div className="text-sm space-y-1">
                            <div>Plate: {booking.assignedVehicle.plateNumber}</div>
                            {booking.assignedVehicle.driverAssigned && (
                              <>
                                <Separator className="my-2" />
                                <div className="font-medium">Driver Assigned</div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {booking.assignedVehicle.driverAssigned.name}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {booking.assignedVehicle.driverAssigned.contact}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Vehicle Assignment
                          </h4>
                          <p className="text-sm text-gray-500">
                            Vehicle details will be assigned once your booking is approved.
                          </p>
                        </div>
                      )}
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleChatSupport}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveRentalsPage;