'use client';
import { useUserStore } from '@/store';
import { useEffect, useMemo, useState } from 'react';
import { BookingFirebaseService, type BookingData } from '@/lib/firebase-booking-service';
import {
  AccountSidebar,
  AccountOverview,
  BookingsSection,
  QuickActions,
} from '@/components/my-account';

export default function MyAccountPage() {
  const { user } = useUserStore();
  const [bookings, setBookings] = useState<BookingData[] | null>(null);

  const isVerified = user?.isVerified === true;
  const kycStatus = user?.kycRecord?.status || 'not_submitted';

  // Compute profile completion heuristically
  const profileCompletion = useMemo(() => {
    if (!user) return 30;
    let score = 0;
    const checks: Array<boolean> = [
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
    const pct = Math.max(20, Math.min(100, Math.round((score / checks.length) * 100)));
    return pct;
  }, [user]);

  // Live bookings snapshot for counts
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = BookingFirebaseService.setupUserBookingsListener(
      user.uid,
      (list) => setBookings(list),
      () => {}
    );
    return () => unsub?.();
  }, [user?.uid]);

  const upcomingCount = useMemo(() => {
    if (!bookings) return 0;
    return bookings.filter((b) => ['processing', 'reserved', 'ongoing'].includes(b.status)).length;
  }, [bookings]);

  const pastCount = useMemo(() => {
    if (!bookings) return 0;
    return bookings.filter((b) => ['completed', 'cancelled', 'refunded'].includes(b.status)).length;
  }, [bookings]);

  const verificationStatus = {
    isVerified,
    kycStatus,
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Account</h1>
        <p className="text-muted-foreground mt-2">Manage your account, bookings, and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <AccountSidebar
          user={user}
          profileCompletion={profileCompletion}
          upcomingCount={upcomingCount}
          pastCount={pastCount}
          verificationStatus={verificationStatus}
        />

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Account Overview */}
          <AccountOverview user={user} verificationStatus={verificationStatus} />

          {/* Bookings Section */}
          <BookingsSection
            upcomingCount={upcomingCount}
            pastCount={pastCount}
            isLoading={bookings === null}
          />

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
