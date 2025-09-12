'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/store';
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  ProfileSidebar,
  ProfileInformation,
  PasswordManagement,
  KYCApplicationViewer,
  ImageViewer,
} from '@/components/user-profile';

const UserProfile = () => {
  const { data: session } = useSession();
  const { user } = useUserStore();
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Determine auth provider
  const getAuthProvider = () => {
    if (!session?.user?.email) return 'email';
    const account = session.user.email;
    if (account.includes('gmail') || session.user.image?.includes('googleusercontent'))
      return 'google';
    if (session.user.image?.includes('facebook') || session.user.image?.includes('fbsbx'))
      return 'facebook';
    return 'email';
  };

  const authProvider = getAuthProvider();

  const handleImageUpload = async (file: File) => {
    if (!user?.uid || !file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB.',
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a valid image file.',
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      // You can implement Firebase Storage upload here
      // For now, we'll show a placeholder message
      toast({
        title: 'Coming Soon',
        description: 'Profile picture upload will be available soon.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload image. Please try again.',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const getVerificationStatus = () => {
    if (user?.isVerified) {
      return { status: 'verified', label: 'Verified', color: 'success', icon: CheckCircle2 };
    }
    if (user?.kycRecord?.status === 'pending') {
      return { status: 'pending', label: 'Under Review', color: 'warning', icon: Clock };
    }
    if (user?.kycRecord?.status === 'rejected') {
      return { status: 'rejected', label: 'Rejected', color: 'destructive', icon: XCircle };
    }
    return { status: 'not_verified', label: 'Not Verified', color: 'secondary', icon: AlertCircle };
  };

  const verificationStatus = getVerificationStatus();

  // Create component instances with proper props
  const KYCViewer = () => (
    <KYCApplicationViewer
      user={user!}
      verificationStatus={verificationStatus}
      onViewImage={setViewingImage}
    />
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account information and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <ProfileSidebar
          user={user}
          verificationStatus={verificationStatus}
          authProvider={authProvider}
          isUploadingImage={isUploadingImage}
          onImageUpload={handleImageUpload}
          KYCApplicationViewer={KYCViewer}
        />

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Information */}
          <ProfileInformation user={user} />

          {/* Password Management */}
          <PasswordManagement authProvider={authProvider} />
        </div>
      </div>

      {/* Image Viewer */}
      <ImageViewer viewingImage={viewingImage} onClose={() => setViewingImage(null)} />
    </div>
  );
};

export default UserProfile;
