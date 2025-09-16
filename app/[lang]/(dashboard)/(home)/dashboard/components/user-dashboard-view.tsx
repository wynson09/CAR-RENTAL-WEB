'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Shield,
  CreditCard,
  MessageCircle,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { useUserStore } from '@/store';
import { useEffect, useState, useMemo } from 'react';
import { BookingFirebaseService, type BookingData } from '@/lib/firebase-booking-service';
import { CarFirebaseService } from '@/lib/firebase-car-service';
import Link from 'next/link';

interface UserDashboardViewProps {
  trans: {
    [key: string]: string;
  };
}

const UserDashboardView = ({ trans }: UserDashboardViewProps) => {
  const { user } = useUserStore();
  const [bookings, setBookings] = useState<BookingData[] | null>(null);
  const [recentCars, setRecentCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user's greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper function to safely format dates
  const formatDate = (date: any) => {
    if (!date) return 'Invalid Date';

    try {
      let dateObj;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string' || typeof date === 'number') {
        dateObj = new Date(date);
      } else if (date.toDate && typeof date.toDate === 'function') {
        // Handle Firestore Timestamp
        dateObj = date.toDate();
      } else {
        return 'Invalid Date';
      }

      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }

      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid Date';
    }
  };

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    let score = 0;
    const checks = [
      !!user.firstName || !!user.name,
      !!user.email,
      !!user.image,
      !!user.kycRecord?.governmentIdFrontImage && !!user.kycRecord?.governmentIdBackImage,
      user.kycRecord?.status === 'approved',
      !!user.kycRecord?.phoneNumber || !!user.kycRecord?.address,
    ];
    checks.forEach((ok) => {
      score += ok ? 1 : 0;
    });
    return Math.round((score / checks.length) * 100);
  }, [user]);

  // Load user bookings
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = BookingFirebaseService.setupUserBookingsListener(
      user.uid,
      (bookingsList) => {
        setBookings(bookingsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe?.();
  }, [user?.uid]);

  // Calculate booking stats
  const bookingStats = useMemo(() => {
    if (!bookings) return { active: 0, upcoming: 0, completed: 0, total: 0 };

    const active = bookings.filter((b) => b.status === 'ongoing').length;
    const upcoming = bookings.filter((b) => ['processing', 'reserved'].includes(b.status)).length;
    const completed = bookings.filter((b) => b.status === 'completed').length;

    return {
      active,
      upcoming,
      completed,
      total: bookings.length,
    };
  }, [bookings]);

  // Get active rental
  const activeRental = useMemo(() => {
    if (!bookings) return null;
    return bookings.find((b) => b.status === 'ongoing') || null;
  }, [bookings]);

  // Get upcoming booking
  const upcomingBooking = useMemo(() => {
    if (!bookings) return null;
    return (
      bookings
        .filter((b) => ['processing', 'reserved'].includes(b.status))
        .sort((a, b) => {
          // BookingData uses pickUpDate, not startDate
          const dateA = a.pickUpDate ? new Date(a.pickUpDate) : new Date();
          const dateB = b.pickUpDate ? new Date(b.pickUpDate) : new Date();
          return dateA.getTime() - dateB.getTime();
        })[0] || null
    );
  }, [bookings]);

  const userName = user?.firstName || user?.name || 'User';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-white/20">
              <AvatarImage src={user?.image} />
              <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {getGreeting()}, {userName}!
              </h1>
              <p className="text-blue-100 mt-1">Ready for your next adventure?</p>
            </div>
          </div>
          <div className="hidden md:flex gap-3">
            <Link href="/start-a-booking">
              <Button
                variant="outline"
                className="bg-white text-blue-700 hover:bg-blue-50 border-white"
              >
                <Car className="h-4 w-4 mr-2" />
                Book a Car
              </Button>
            </Link>
            <Link href="/support-chat">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <MessageCircle className="h-4 w-4 mr-2" />
                Get Help
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        <Link href="/start-a-booking">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Car className="h-4 w-4 mr-2" />
            Book a Car
          </Button>
        </Link>
        <Link href="/support-chat">
          <Button variant="outline" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Get Help
          </Button>
        </Link>
      </div>

      {/* Active Rental Alert */}
      {activeRental && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Car className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                  Active Rental
                </h3>
                <p className="text-orange-700 dark:text-orange-200 mt-1">
                  {activeRental.selectedVehicles?.name ||
                    activeRental.assignedVehicle?.name ||
                    'Vehicle'}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                  Return by: {formatDate(activeRental.returnDate)}
                </p>
              </div>
              <Link href="/active-rentals">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  View Details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookingStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Trips</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookingStats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookingStats.upcoming}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profileCompletion}%</p>
                <p className="text-sm text-muted-foreground">Profile</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Booking */}
          {upcomingBooking && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Next Booking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div>
                    <h3 className="font-semibold">
                      {upcomingBooking.selectedVehicles?.name ||
                        upcomingBooking.assignedVehicle?.name ||
                        'Vehicle'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(upcomingBooking.pickUpDate)} -{' '}
                      {formatDate(upcomingBooking.returnDate)}
                    </p>
                    <Badge variant="soft" className="mt-2">
                      {upcomingBooking.status}
                    </Badge>
                  </div>
                  <Link href="/active-rentals">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link href="/start-a-booking">
                  <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                    <Car className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-medium">Book a Car</h3>
                    <p className="text-sm text-muted-foreground">Find your perfect ride</p>
                  </div>
                </Link>

                <Link href="/active-rentals">
                  <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                    <Clock className="h-8 w-8 text-orange-600 mb-2" />
                    <h3 className="font-medium">My Rentals</h3>
                    <p className="text-sm text-muted-foreground">View all bookings</p>
                  </div>
                </Link>

                <Link href="/car-listings">
                  <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                    <Heart className="h-8 w-8 text-red-600 mb-2" />
                    <h3 className="font-medium">Browse Cars</h3>
                    <p className="text-sm text-muted-foreground">Explore our fleet</p>
                  </div>
                </Link>

                <Link href="/my-account">
                  <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                    <Shield className="h-8 w-8 text-green-600 mb-2" />
                    <h3 className="font-medium">My Account</h3>
                    <p className="text-sm text-muted-foreground">Manage profile</p>
                  </div>
                </Link>

                <Link href="/support-chat">
                  <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                    <MessageCircle className="h-8 w-8 text-purple-600 mb-2" />
                    <h3 className="font-medium">Get Support</h3>
                    <p className="text-sm text-muted-foreground">Chat with us</p>
                  </div>
                </Link>

                <Link href="/previous-rentals">
                  <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                    <TrendingUp className="h-8 w-8 text-indigo-600 mb-2" />
                    <h3 className="font-medium">Rental History</h3>
                    <p className="text-sm text-muted-foreground">View past trips</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {bookings && bookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Car className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {booking.selectedVehicles?.name ||
                            booking.assignedVehicle?.name ||
                            'Vehicle'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(booking.pickUpDate)}
                        </p>
                      </div>
                      <Badge variant={booking.status === 'completed' ? 'soft' : 'outline'}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Complete your profile</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2 mb-4" />
                </div>
                {profileCompletion < 100 && (
                  <Link href="/my-account">
                    <Button variant="outline" size="sm" className="w-full">
                      Complete Profile
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Verified</span>
                {user?.isVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ID Verification</span>
                {user?.kycRecord?.status === 'approved' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Method</span>
                <CreditCard className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Our support team is here to help with any questions or issues.
              </p>
              <Link href="/support-chat">
                <Button className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardView;
