'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, FileText, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { UserData } from '@/store';

interface ProfileSidebarProps {
  user: UserData;
  verificationStatus: {
    status: string;
    label: string;
    color: string;
    icon: React.ComponentType<any>;
  };
  authProvider: string;
  isUploadingImage: boolean;
  onImageUpload: (file: File) => void;
  KYCApplicationViewer: React.ComponentType;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  user,
  verificationStatus,
  authProvider,
  isUploadingImage,
  onImageUpload,
  KYCApplicationViewer,
}) => {
  const StatusIcon = verificationStatus.icon;

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Profile Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-24 h-24">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                <AvatarFallback className="text-lg">
                  {user.name?.charAt(0)?.toUpperCase() ||
                    user.email?.charAt(0)?.toUpperCase() ||
                    'U'}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImageUpload(file);
                }}
                className="hidden"
                id="profile-picture-upload"
              />
              <Button
                size="lg"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-10 w-10 p-0 rounded-full bg-gray-100 hover:bg-gray-200 border-2 border-white shadow-lg"
                onClick={() => document.getElementById('profile-picture-upload')?.click()}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                ) : (
                  <Camera className="w-7 h-7 text-gray-700" />
                )}
              </Button>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user.name || 'User'}</h3>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
            <Badge
              variant="outline"
              className={
                verificationStatus.color === 'success'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : verificationStatus.color === 'warning'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : verificationStatus.color === 'destructive'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {verificationStatus.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="font-medium">
              {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Verification Status</span>
            <span className="font-medium">
              {verificationStatus.status === 'verified' ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Login Method</span>
            <span className="font-medium">
              {authProvider === 'google'
                ? 'Google'
                : authProvider === 'facebook'
                ? 'Facebook'
                : 'Email'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* KYC Actions */}
      {user.kycRecord && user.kycRecord.status !== 'not_submitted' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <KYCApplicationViewer />
            {user.kycRecord.status === 'rejected' && (
              <Link href="/user-profile/verify" className="block mt-3">
                <Button variant="outline" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resubmit Application
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileSidebar;
