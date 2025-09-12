'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User2, Mail, Phone, MapPin, Calendar, Shield, Users, Globe } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { UserData } from '@/store';

interface ProfileInformationProps {
  user: UserData;
}

const ProfileInformation: React.FC<ProfileInformationProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.kycRecord?.phoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneUpdate = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'kycRecord.phoneNumber': phoneNumber,
        updatedAt: new Date(),
      });

      toast({
        title: 'Success',
        description: 'Phone number updated successfully.',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating phone:', error);
      toast({
        title: 'Error',
        description: 'Failed to update phone number. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User2 className="w-5 h-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Your basic account information. Update your phone number or verify your account for better
          security.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User2 className="w-4 h-4" />
              Full Name
            </Label>
            <Input value={user.name || ''} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Name cannot be changed due to KYC verification requirements
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input value={user.email || ''} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed for security reasons
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <div className="flex gap-2">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your phone number"
                className={!isEditing ? 'bg-muted' : ''}
              />
              <Button
                variant={isEditing ? 'soft' : 'outline'}
                size="sm"
                onClick={isEditing ? handlePhoneUpdate : () => setIsEditing(true)}
                disabled={isLoading}
                className="whitespace-nowrap"
              >
                {isLoading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
              </Button>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setPhoneNumber(user?.kycRecord?.phoneNumber || '');
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              value={
                user.kycRecord?.city && user.kycRecord?.state
                  ? `${user.kycRecord.city}, ${user.kycRecord.state}`
                  : 'Not provided'
              }
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Complete KYC verification to update location
            </p>
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Birth Date
            </Label>
            <Input
              value={user.kycRecord?.birthDate || 'Not provided'}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Complete KYC verification to update birth date
            </p>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gender
            </Label>
            <Input
              value={
                user.kycRecord?.gender
                  ? user.kycRecord.gender.charAt(0).toUpperCase() + user.kycRecord.gender.slice(1)
                  : 'Not provided'
              }
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Complete KYC verification to update gender
            </p>
          </div>

          {/* Nationality */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Nationality
            </Label>
            <Input
              value={
                user.kycRecord?.nationality
                  ? user.kycRecord.nationality.charAt(0).toUpperCase() +
                    user.kycRecord.nationality.slice(1)
                  : 'Not provided'
              }
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Complete KYC verification to update nationality
            </p>
          </div>
        </div>

        {/* Verification Alert */}
        {!user.isVerified && (!user.kycRecord || user.kycRecord.status === 'not_submitted') && (
          <Alert className="mt-6">
            <Shield className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between w-full">
              <span>
                Complete your KYC verification to unlock all features and enjoy a 5% discount on
                rentals.
              </span>
              <Link href="/user-profile/verify">
                <Button size="sm" className="ml-4">
                  Verify Now
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileInformation;
