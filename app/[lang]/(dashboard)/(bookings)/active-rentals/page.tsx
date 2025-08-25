'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { BookingFirebaseService, BookingData } from '@/lib/firebase-booking-service';
import { useUserStore } from '@/store';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MessageCircle,
  Calendar,
  Car as CarIcon,
  Clock,
  MapPin,
  User,
  Phone,
  AlertCircle,
  Loader2,
} from 'lucide-react';

type ViewMode = 'table' | 'grid';

// Real-time listener for active bookings - no caching needed

const ActiveRentalsPage = () => {
  const router = useRouter();
  const { user } = useUserStore();

  const [activeBookings, setActiveBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoized active statuses to ensure consistency
  const activeStatuses = useMemo(() => ['processing', 'reserved', 'ongoing'], []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupRealtimeListener = () => {
      if (!user?.uid) {
        setError('Please sign in to view your bookings');
        setIsLoading(false);
        return;
      }

      try {
        unsubscribe = BookingFirebaseService.setupUserBookingsListener(
          user.uid,
          (allBookings) => {
            // Filter for active bookings in real-time
            const activeBookings = allBookings.filter((booking) =>
              activeStatuses.includes(booking.status)
            );

            setActiveBookings(activeBookings);
            setError(null);
            setIsLoading(false);

            // Show toast only for new bookings (optional)
            // if (activeBookings.length > prevActiveBookings.length) {
            //   toast.success('New booking received!');
            // }
          },
          (error) => {
            console.error('Real-time listener error:', error);

            let errorMessage = 'Unable to load your bookings';

            if (error.code === 'permission-denied') {
              errorMessage = 'Please sign in to view your bookings';
            } else if (error.code === 'unauthenticated') {
              errorMessage = 'Authentication required. Please sign in again.';
            } else if (error.code === 'unavailable') {
              errorMessage = 'Service temporarily unavailable. Please try again later.';
            } else if (error.message?.includes('network')) {
              errorMessage = 'Network error. Please check your connection.';
            }

            setError(errorMessage);
            setIsLoading(false);

            if (!['permission-denied', 'unauthenticated'].includes(error.code)) {
              toast.error(errorMessage);
            }
          }
        );
      } catch (error) {
        console.error('Setup listener error:', error);
        setError('Failed to connect to database');
        setIsLoading(false);
      }
    };

    setupRealtimeListener();

    // Cleanup listener on unmount or user change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid, activeStatuses]);

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

  const handleManualRefresh = async () => {
    if (!user?.uid || isRefreshing) return;

    setIsRefreshing(true);
    try {
      // Force a fresh fetch by bypassing the real-time listener momentarily
      const allBookings = await BookingFirebaseService.getUserBookings(user.uid);
      const activeBookings = allBookings.filter((booking) =>
        activeStatuses.includes(booking.status)
      );
      setActiveBookings(activeBookings);
      setError(null);
      toast.success('Active rentals refreshed successfully');
    } catch (error: any) {
      console.error('Manual refresh error:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
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
    router.push('/chat');
  };

  const handleViewDetails = (booking: BookingData) => {
    router.push(`/booking-complete?bookingId=${(booking as any).id}`);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4 p-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-16">
      <CarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No Active Rentals
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        You don't have any active or upcoming rentals at the moment.
      </p>
      <Button onClick={() => router.push('/start-a-booking')}>Start a New Booking</Button>
    </div>
  );

  // Error state
  const ErrorState = () => {
    const isAuthError = error?.includes('sign in') || error?.includes('Authentication');

    return (
      <div className="text-center py-16">
        <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {isAuthError ? 'Authentication Required' : 'Error Loading Bookings'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <div className="space-x-4">
          {isAuthError ? (
            <>
              <Button onClick={() => router.push('/auth/login')} variant="outline">
                Sign In
              </Button>
              <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            </>
          ) : (
            <>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => router.push('/start-a-booking')}>Start a Booking</Button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Table view component
  const BookingTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vehicle</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Pickup Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activeBookings.map((booking, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center gap-3">
                <img
                  src={booking.selectedVehicles.vehicleUrl}
                  alt={booking.selectedVehicles.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/all-img/comming-soon.png';
                  }}
                />
                <div>
                  <p className="font-medium">{booking.selectedVehicles.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.driveOption.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{booking.destination}</p>
                <p className="text-sm text-muted-foreground">
                  {getAddressLabel(booking.pickUpAddress)}
                </p>
              </div>
            </TableCell>
            <TableCell>
              {booking.selectedVehicles.totalDuration} day
              {booking.selectedVehicles.totalDuration !== 1 ? 's' : ''}
            </TableCell>
            <TableCell className="font-medium">
              {formatCurrency(booking.selectedVehicles.totalAmount)}
            </TableCell>
            <TableCell>
              <Badge className={cn('capitalize', getStatusBadgeColor(booking.status))}>
                {booking.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{formatDate(booking.pickUpDate)}</div>
                <div className="text-muted-foreground">{booking.pickUpTime}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking)}>
                  View Details
                </Button>
                <Button variant="outline" size="sm" onClick={handleChatSupport}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Grid view component
  const BookingGridView = () => (
    <div className="grid gap-6 p-6">
      {activeBookings.map((booking, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <img
                  src={booking.selectedVehicles.vehicleUrl}
                  alt={booking.selectedVehicles.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/all-img/comming-soon.png';
                  }}
                />
                <div>
                  <CardTitle className="mb-2">{booking.selectedVehicles.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={cn('capitalize', getStatusBadgeColor(booking.status))}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-xl font-bold">
                  {formatCurrency(booking.selectedVehicles.totalAmount)}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Trip Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Trip Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Destination:</span>
                      <div className="font-medium">{booking.destination}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="font-medium">
                        {booking.selectedVehicles.totalDuration} day
                        {booking.selectedVehicles.totalDuration !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Drive Option:</span>
                      <div className="font-medium capitalize">
                        {booking.driveOption.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
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

              {/* Payment & Actions */}
              <div className="space-y-4">
                {booking.payment && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Payment Status
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">
                          {formatCurrency(booking.payment.totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Paid:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(booking.payment.paid)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Balance:</span>
                        <span className="font-medium text-orange-600">
                          {formatCurrency(booking.payment.balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button className="w-full" onClick={() => handleViewDetails(booking)}>
                    View Full Details
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleChatSupport}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Active Rentals</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your current and upcoming car rentals •{' '}
          <span className="text-green-600 dark:text-green-400 font-medium">Real-time updates</span>
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {activeBookings.length} Active Rental{activeBookings.length !== 1 ? 's' : ''}
            </h2>
            <div className="text-sm text-muted-foreground">(Processing, Reserved, Ongoing)</div>
          </div>

          <div className="flex items-center gap-4">
            {/* Manual Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-2"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon icon="heroicons:arrow-path" className="h-4 w-4" />
              )}
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'table' ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-r-none"
                disabled={isLoading}
              >
                <Icon icon="heroicons:list-bullet" className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
                disabled={isLoading}
              >
                <Icon icon="heroicons:squares-2x2" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState />
          ) : activeBookings.length === 0 ? (
            <EmptyState />
          ) : viewMode === 'table' ? (
            <BookingTableView />
          ) : (
            <BookingGridView />
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      {!isLoading && !error && (
        <div className="text-sm text-muted-foreground">
          Showing {activeBookings.length} active rental{activeBookings.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default ActiveRentalsPage;
