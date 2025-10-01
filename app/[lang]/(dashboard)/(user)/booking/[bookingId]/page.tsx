'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Car as CarIcon,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Users,
  Settings,
} from 'lucide-react';
import { BookingFirebaseService, BookingData } from '@/lib/firebase-booking-service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUserStore } from '@/store';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { PriceBreakdown } from '@/components/booking-complete/price-breakdown';

// Cache for booking details to avoid unnecessary fetches
const bookingDetailsCache = new Map<string, { data: BookingData; timestamp: number }>();
const BOOKING_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

const BookingDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;
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
        console.error('Error fetching booking:', error);
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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reserved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Partial</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Unpaid</Badge>;
      case 'refunded':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Refunded</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatLocationName = (location: string) => {
    if (location === 'nacs-garage' || location === 'nacs-garage-return') {
      return '@Nacs Car Rental Garage';
    }
    return location;
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
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
              <Button onClick={handleGoBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-[1600px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="hover:bg-white hover:shadow-sm transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Booking Details</h1>
            <p className="text-muted-foreground font-medium">Booking ID: {bookingId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Vehicle Information */}
            <Card className="shadow-sm border border-border bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <CarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative group">
                      <Image
                        src={
                          booking.selectedVehicles.vehicleUrl || '/images/all-img/comming-soon.png'
                        }
                        alt={booking.selectedVehicles.name}
                        width={280}
                        height={200}
                        className="rounded-xl object-contain bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 w-full lg:w-72 shadow-sm border border-border transition-transform group-hover:scale-[1.02]"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='200' viewBox='0 0 280 200'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3ECar%3C/text%3E%3C/svg%3E"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <h3 className="text-2xl font-bold">{booking.selectedVehicles.name}</h3>
                      <Badge
                        className={cn(
                          'w-fit px-3 py-1 text-sm font-medium',
                          getStatusBadgeColor(booking.bookingDetails.status)
                        )}
                      >
                        {booking.bookingDetails.status.charAt(0).toUpperCase() +
                          booking.bookingDetails.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border shadow-sm">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Settings className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            Drive Option
                          </p>
                          <p className="font-medium capitalize">
                            {booking.bookingDetails.driveOption.replace('-', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border shadow-sm">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            Duration
                          </p>
                          <p className="font-medium">
                            {booking.selectedVehicles.totalDuration} days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border shadow-sm">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            ZDS Area
                          </p>
                          <p className="font-medium">
                            {booking.bookingDetails.withInZDS ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Vehicle (if available) */}
            {booking.assignedVehicle && (
              <Card className="shadow-sm border border-border bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    Assigned Vehicle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                        <p className="text-lg font-semibold">{booking.assignedVehicle.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Plate Number</p>
                        <p className="text-lg font-semibold">
                          {booking.assignedVehicle.plateNumber}
                        </p>
                      </div>
                    </div>

                    {booking.assignedVehicle.driverAssigned && (
                      <div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Assigned Driver
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Name</p>
                              <p className="font-medium">
                                {booking.assignedVehicle.driverAssigned.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Contact</p>
                              <p className="font-medium">
                                {booking.assignedVehicle.driverAssigned.contact}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trip Details */}
            <Card className="shadow-sm border border-border bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-xl border border-border shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Destination
                    </p>
                    <p className="text-xl font-bold">{booking.bookingDetails.destination}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pickup Details */}
                    <div className="bg-muted/50 rounded-xl p-5 border border-border shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
                        <p className="font-semibold text-green-700 text-lg">Pickup</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                            Location
                          </p>
                          <p className="font-medium">
                            {formatLocationName(booking.bookingDetails.pickUpAddress)}
                          </p>
                          {booking.bookingDetails.pickupPagadianDetails && (
                            <p className="text-sm text-gray-600 mt-1">
                              {booking.bookingDetails.pickupPagadianDetails}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {format(parseISO(booking.bookingDetails.pickUpDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                            <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {booking.bookingDetails.pickUpTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Return Details */}
                    <div className="bg-muted/50 rounded-xl p-5 border border-border shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                        <p className="font-semibold text-red-700 text-lg">Return</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                            Location
                          </p>
                          <p className="font-medium">
                            {formatLocationName(booking.bookingDetails.returnAddress)}
                          </p>
                          {booking.bookingDetails.returnPagadianDetails && (
                            <p className="text-sm text-gray-600 mt-1">
                              {booking.bookingDetails.returnPagadianDetails}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {format(parseISO(booking.bookingDetails.returnDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                            <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {booking.bookingDetails.returnTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extensions (if any) */}
            {booking.extensions && booking.extensions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Booking Extensions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {booking.extensions.map((extension, index) => (
                      <div key={index} className="border rounded-lg p-6 bg-blue-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                          <div>
                            <p className="text-muted-foreground">Previous Return</p>
                            <p className="font-medium">
                              {format(parseISO(extension.previousReturnDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">New Return Date</p>
                            <p className="font-medium">
                              {format(parseISO(extension.newReturnDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Additional Days</p>
                            <p className="font-medium">
                              {extension.additionalDays} day
                              {extension.additionalDays !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Additional Cost</p>
                            <p className="font-medium text-blue-600">
                              {formatCurrency(extension.additionalAmount)}
                            </p>
                          </div>
                        </div>
                        {extension.extendedAt && (
                          <div className="mt-3 text-xs text-muted-foreground">
                            Extended on{' '}
                            {format(
                              extension.extendedAt instanceof Date
                                ? extension.extendedAt
                                : new Date(extension.extendedAt),
                              'MMM dd, yyyy HH:mm'
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Renter Information */}
            <Card className="shadow-sm border border-border bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Renter Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        Full Name
                      </p>
                    </div>
                    <p className="font-semibold text-lg">
                      {booking.renterInformation.firstName} {booking.renterInformation.lastName}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        Email
                      </p>
                    </div>
                    <p className="font-medium break-all">{booking.renterInformation.email}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        Phone
                      </p>
                    </div>
                    <p className="font-medium">{booking.renterInformation.phone}</p>
                  </div>
                  <div className="md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        Address
                      </p>
                    </div>
                    <p className="font-medium">{booking.renterInformation.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-2 space-y-6">
            {/* Price Breakdown */}
            <Card>
              <CardContent className="p-6">
                <PriceBreakdown
                  pricePerDay={booking.selectedVehicles.pricePerDay}
                  totalDuration={booking.selectedVehicles.totalDuration}
                  driveOption={booking.bookingDetails.driveOption}
                  driverPerDay={booking.bookingDetails.driverPerDay}
                  discounts={
                    booking.selectedVehicles.discounts?.map((d) => ({ ...d, applied: true })) || []
                  }
                  extraCharges={booking.selectedVehicles.extraCharges || []}
                  totalAmount={booking.selectedVehicles.totalAmount}
                />
              </CardContent>
            </Card>

            {/* Payment Status */}
            {booking.payment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status</span>
                    {getPaymentStatusBadge(booking.payment.status)}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Amount</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(booking.payment.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Paid</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(booking.payment.paid)}
                      </span>
                    </div>
                    {booking.payment.balance > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Balance</span>
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(booking.payment.balance)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Source</p>
                  <p className="font-medium capitalize">{booking.bookingDetails.bookingSource}</p>
                </div>
                {booking.createdAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium">
                      {format(
                        booking.createdAt instanceof Date
                          ? booking.createdAt
                          : new Date(booking.createdAt),
                        'MMM dd, yyyy HH:mm'
                      )}
                    </p>
                  </div>
                )}
                {booking.updatedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {format(
                        booking.updatedAt instanceof Date
                          ? booking.updatedAt
                          : new Date(booking.updatedAt),
                        'MMM dd, yyyy HH:mm'
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
