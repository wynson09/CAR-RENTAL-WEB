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
    <div className="w-full px-2 py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <p className="text-muted-foreground">Booking ID: {bookingId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CarIcon className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src={booking.selectedVehicles.vehicleUrl || '/images/all-img/comming-soon.png'}
                    alt={booking.selectedVehicles.name}
                    width={240}
                    height={180}
                    className="rounded-lg object-contain bg-gray-100 w-full lg:w-60"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='180' viewBox='0 0 240 180'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3ECar%3C/text%3E%3C/svg%3E"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold">{booking.selectedVehicles.name}</h3>
                      <Badge
                        className={cn('mt-2', getStatusBadgeColor(booking.bookingDetails.status))}
                      >
                        {booking.bookingDetails.status.charAt(0).toUpperCase() +
                          booking.bookingDetails.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Drive Option:{' '}
                        <span className="font-medium">
                          {booking.bookingDetails.driveOption.replace('-', ' ')}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Duration:{' '}
                        <span className="font-medium">
                          {booking.selectedVehicles.totalDuration} days
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        ZDS Area:{' '}
                        <span className="font-medium">
                          {booking.bookingDetails.withInZDS ? 'Yes' : 'No'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Source:{' '}
                        <span className="font-medium capitalize">
                          {booking.bookingDetails.bookingSource}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Vehicle (if available) */}
          {booking.assignedVehicle && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Assigned Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                      <p className="text-lg font-semibold">{booking.assignedVehicle.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Plate Number</p>
                      <p className="text-lg font-semibold">{booking.assignedVehicle.plateNumber}</p>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Destination</p>
                  <p className="text-xl font-bold text-primary">
                    {booking.bookingDetails.destination}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Pickup Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <p className="font-medium">Pickup</p>
                    </div>
                    <div className="ml-5 space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{booking.bookingDetails.pickUpAddress}</p>
                        {booking.bookingDetails.pickupPagadianDetails && (
                          <p className="text-sm text-muted-foreground">
                            {booking.bookingDetails.pickupPagadianDetails}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(parseISO(booking.bookingDetails.pickUpDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{booking.bookingDetails.pickUpTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Return Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <p className="font-medium">Return</p>
                    </div>
                    <div className="ml-5 space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{booking.bookingDetails.returnAddress}</p>
                        {booking.bookingDetails.returnPagadianDetails && (
                          <p className="text-sm text-muted-foreground">
                            {booking.bookingDetails.returnPagadianDetails}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(parseISO(booking.bookingDetails.returnDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{booking.bookingDetails.returnTime}</span>
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
                    <div key={index} className="border rounded-lg p-4 bg-blue-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
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
                          <p className="text-muted-foreground">Additional Cost</p>
                          <p className="font-medium text-blue-600">
                            {formatCurrency(extension.additionalAmount)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Extended {extension.additionalDays} additional day
                        {extension.additionalDays !== 1 ? 's' : ''}
                        {extension.extendedAt && (
                          <span>
                            {' '}
                            • Extended on{' '}
                            {format(
                              typeof extension.extendedAt.toDate === 'function'
                                ? extension.extendedAt.toDate()
                                : new Date(extension.extendedAt),
                              'MMM dd, yyyy'
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Renter Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Renter Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="font-semibold">
                    {booking.renterInformation.firstName} {booking.renterInformation.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </p>
                  <p className="font-medium">{booking.renterInformation.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </p>
                  <p className="font-medium">{booking.renterInformation.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="font-medium">{booking.renterInformation.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <div className="w-full">
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
          </div>

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
                      typeof booking.createdAt.toDate === 'function'
                        ? booking.createdAt.toDate()
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
                      typeof booking.updatedAt.toDate === 'function'
                        ? booking.updatedAt.toDate()
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
  );
};

export default BookingDetailsPage;
