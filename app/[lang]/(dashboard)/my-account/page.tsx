'use client';
import Link from 'next/link';
import { useUserStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  ChevronRight,
  User2,
  Calendar,
  FileText,
  Bell,
  Shield,
  LifeBuoy,
  Smartphone,
  Key,
  Trash,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { BookingFirebaseService, type BookingData } from '@/lib/firebase-booking-service';

const Section = ({
  title,
  children,
  href,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  href: string;
  icon: React.ReactNode;
}) => {
  return (
    <Link href={href} className="block">
      <Card className="hover:border-primary/40 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-primary">{icon}</span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{children}</div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
};

export default function MyAccountPage() {
  const { user } = useUserStore();
  const [bookings, setBookings] = useState<BookingData[] | null>(null);

  const userName = user?.name || 'Your name';
  const userEmail = user?.email || '';
  const userImage = user?.image || '';
  const isVerified = user?.isVerified === true; // strict match to Firestore boolean

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

  return (
    <div className="max-w-5xl mx-auto pt-6 space-y-6">
      {/* Header / Identity */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold truncate max-w-[220px] sm:max-w-none">
                  {userName}
                </h2>
                {isVerified ? (
                  <Badge variant="default" className="bg-emerald-500 text-white gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1">
                    <XCircle className="w-4 h-4" /> Not verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
            </div>
            {!isVerified && (
              <Link href="/user-profile/settings">
                <Button size="sm" className="whitespace-nowrap">
                  Verify now
                </Button>
              </Link>
            )}
          </div>
          {/* Progress */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Profile completion</span>
              <span className="font-medium">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} />
          </div>
        </CardContent>
      </Card>

      {/* Verification & Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Verification status & benefits</CardTitle>
          <CardDescription>Complete your KYC to unlock member perks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerified ? (
            <Alert color="success" variant="soft" className="items-start">
              <div className="grow">
                <AlertTitle className="mb-1">You're verified</AlertTitle>
                <AlertDescription>
                  You get a <span className="font-semibold">5% discount</span> on every rental and
                  faster booking approval.
                </AlertDescription>
              </div>
            </Alert>
          ) : (
            <Alert color="warning" variant="outline" className="items-start">
              <div className="grow">
                <AlertTitle className="mb-1">Not verified</AlertTitle>
                <AlertDescription>
                  Verify your account to enjoy a <span className="font-semibold">5% discount</span>{' '}
                  on all rentals.
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <Section title="Profile" href="/user-profile" icon={<User2 className="w-5 h-5" />}>
              Manage your personal info, avatar, and phone/address
            </Section>
            <Section
              title="Settings"
              href="/user-profile/settings"
              icon={<Shield className="w-5 h-5" />}
            >
              Update password and account preferences
            </Section>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings overview</CardTitle>
          <CardDescription>Quick glance at your rentals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Card className="shadow-none border-dashed">
              <CardHeader className="mb-1">
                <CardTitle className="text-base">Upcoming</CardTitle>
                <CardDescription>Next trips and active rentals</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold">{bookings ? upcomingCount : '—'}</div>
                <div className="mt-3">
                  <Link href="/active-rentals">
                    <Button size="sm" variant="outline">
                      View active
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none border-dashed">
              <CardHeader className="mb-1">
                <CardTitle className="text-base">Past</CardTitle>
                <CardDescription>Completed and cancelled</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold">{bookings ? pastCount : '—'}</div>
                <div className="mt-3">
                  <Link href="/previous-rentals">
                    <Button size="sm" variant="outline">
                      View history
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none border-dashed">
              <CardHeader className="mb-1">
                <CardTitle className="text-base">New booking</CardTitle>
                <CardDescription>Find a car and book</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/start-a-booking">
                  <Button size="sm">Start a booking</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Billing */}
      <Card>
        <CardHeader>
          <CardTitle>Payment & billing</CardTitle>
          <CardDescription>Manage methods and view invoices</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          <Section
            title="Payment methods"
            href="/billing/payment-methods"
            icon={<CreditCard className="w-5 h-5" />}
          >
            Add/remove cards and wallets
          </Section>
          <Section
            title="Transactions"
            href="/invoice-list"
            icon={<FileText className="w-5 h-5" />}
          >
            Rental invoices & receipts
          </Section>
        </CardContent>
      </Card>

      {/* Notifications / Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Reminders, payments, and offers</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3">
          <Section
            title="Return reminders"
            href="/active-rentals"
            icon={<Calendar className="w-5 h-5" />}
          >
            Get notified about upcoming returns
          </Section>
          <Section title="Payment alerts" href="/invoice-list" icon={<Bell className="w-5 h-5" />}>
            Pending or failed payments
          </Section>
          <Section title="Promotions" href="/dashboard" icon={<FileText className="w-5 h-5" />}>
            Seasonal deals and discounts
          </Section>
        </CardContent>
      </Card>

      {/* Security & Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security & settings</CardTitle>
          <CardDescription>Keep your account safe</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          <Section
            title="Change password"
            href="/user-profile/settings"
            icon={<Key className="w-5 h-5" />}
          >
            Update your password securely
          </Section>
          <Section
            title="Two-Factor Auth"
            href="/user-profile/settings"
            icon={<Smartphone className="w-5 h-5" />}
          >
            Add extra protection to your account
          </Section>
          <Section
            title="Login activity"
            href="/user-profile/activity"
            icon={<Lock className="w-5 h-5" />}
          >
            Last login and active devices
          </Section>
          <Section
            title="Delete account"
            href="/user-profile/settings"
            icon={<Trash className="w-5 h-5" />}
          >
            Permanently remove your data
          </Section>
        </CardContent>
      </Card>

      {/* Support / Help */}
      <Card>
        <CardHeader>
          <CardTitle>Support & help</CardTitle>
          <CardDescription>We’re here to help</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3">
          <Section
            title="Contact support"
            href="/support-chat"
            icon={<LifeBuoy className="w-5 h-5" />}
          >
            Chat, email, or hotline
          </Section>
          <Section title="FAQs" href="/react-email" icon={<User2 className="w-5 h-5" />}>
            Browse the Help Center
          </Section>
          <Section
            title="Report an issue"
            href="/enhanced-chat"
            icon={<Bell className="w-5 h-5" />}
          >
            Open a ticket
          </Section>
        </CardContent>
      </Card>
    </div>
  );
}
