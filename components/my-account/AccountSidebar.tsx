'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, User2, Clock, Calendar, CreditCard, LifeBuoy } from 'lucide-react';
import Link from 'next/link';
import { UserData } from '@/store';

interface AccountSidebarProps {
  user: UserData;
  profileCompletion: number;
  upcomingCount: number;
  pastCount: number;
  verificationStatus: {
    isVerified: boolean;
    kycStatus: string;
  };
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({
  user,
  profileCompletion,
  upcomingCount,
  pastCount,
  verificationStatus,
}) => {
  const { isVerified, kycStatus } = verificationStatus;
  const userName = user?.name || 'Your name';
  const userEmail = user?.email || '';
  const userImage = user?.image || '';

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Profile Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-24 h-24">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {userName.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{userName}</h3>
              <p className="text-muted-foreground text-sm">{userEmail}</p>
            </div>
            <Badge
              variant="outline"
              className={
                isVerified
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
              }
            >
              {isVerified ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Verified
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Completion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
          </div>
          {profileCompletion < 100 && (
            <div className="text-xs text-muted-foreground">
              Complete your profile to unlock all features
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="font-medium">
              {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Active Bookings</span>
            <span className="font-medium">{upcomingCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Rentals</span>
            <span className="font-medium">{pastCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="font-medium">
              {kycStatus === 'pending' ? 'Under Review' : isVerified ? 'Verified' : 'Basic'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isVerified && kycStatus === 'not_submitted' && (
            <Link href="/user-profile/verify" className="block">
              <Button className="w-full justify-start" size="sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Verify Account
              </Button>
            </Link>
          )}
          {!isVerified && kycStatus === 'rejected' && (
            <Link href="/user-profile/verify" className="block">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <XCircle className="w-4 h-4 mr-2" />
                Resubmit Verification
              </Button>
            </Link>
          )}
          <Link href="/user-profile" className="block">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <User2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
          <Link href="/start-a-booking" className="block">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </Link>
          <Link href="/billing/payment-methods" className="block">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Methods
            </Button>
          </Link>
          <Link href="/support-chat" className="block">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <LifeBuoy className="w-4 h-4 mr-2" />
              Get Support
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSidebar;
