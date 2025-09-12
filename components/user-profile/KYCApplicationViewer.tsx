'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, RotateCcw, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { UserData } from '@/store';

interface KYCApplicationViewerProps {
  user: UserData;
  verificationStatus: {
    status: string;
    label: string;
    color: string;
    icon: React.ComponentType<any>;
  };
  onViewImage: (src: string) => void;
}

const KYCApplicationViewer: React.FC<KYCApplicationViewerProps> = ({
  user,
  verificationStatus,
  onViewImage,
}) => {
  const kyc = user?.kycRecord;
  if (!kyc || kyc.status === 'not_submitted') return null;

  const StatusIcon = verificationStatus.icon;

  const ImagePreview = ({ src, alt, label }: { src?: string; alt: string; label: string }) => {
    if (!src) return null;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden border">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            onClick={() => onViewImage(src)}
          />
          <Button
            size="lg"
            variant="outline"
            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-gray-100/90 hover:bg-gray-200/90 border-white shadow-md backdrop-blur-sm"
            onClick={() => onViewImage(src)}
          >
            <Eye className="w-4 h-4 text-gray-700" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileText className="w-4 h-4 mr-2" />
          View Account Verification
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] max-w-[1200px] max-h-[90vh] overflow-y-auto p-6 gap-0"
        style={{ width: '95vw', maxWidth: '1200px' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Account Verification Details
          </DialogTitle>
          <DialogDescription>
            Review your submitted verification information and documents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          {/* Status */}
          <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
            <StatusIcon className="w-5 h-5" />
            <span className="font-medium">Status: {verificationStatus.label}</span>
            {kyc.status === 'rejected' && kyc.statusMessage && (
              <div className="ml-auto">
                <Alert className="max-w-md">
                  <AlertDescription>
                    <strong>Rejection Reason:</strong> {kyc.statusMessage}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              <div>
                <Label>First Name</Label>
                <Input value={user?.firstName || ''} disabled />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={user?.lastName || ''} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>
              <div>
                <Label>Birth Date</Label>
                <Input value={kyc.birthDate || 'Not provided'} disabled />
              </div>
              <div>
                <Label>Gender</Label>
                <Input value={kyc.gender || 'Not provided'} disabled />
              </div>
              <div>
                <Label>Nationality</Label>
                <Input value={kyc.nationality || 'Not provided'} disabled />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={kyc.phoneNumber || 'Not provided'} disabled />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input value={kyc.address || 'Not provided'} disabled />
              </div>
              <div>
                <Label>City</Label>
                <Input value={kyc.city || 'Not provided'} disabled />
              </div>
              <div>
                <Label>State/Province</Label>
                <Input value={kyc.state || 'Not provided'} disabled />
              </div>
              <div>
                <Label>Zip Code</Label>
                <Input value={kyc.zipCode || 'Not provided'} disabled />
              </div>
            </div>
          </div>

          {/* ID Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              <div>
                <Label>Government ID Type</Label>
                <Input value={kyc.governmentIdType || 'Not provided'} disabled />
              </div>
              <div>
                <Label>ID Number</Label>
                <Input value={kyc.governmentId || 'Not provided'} disabled />
              </div>
            </div>

            {/* Document Images */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-8">
              <ImagePreview
                src={kyc.governmentIdFrontImage}
                alt="Government ID Front"
                label="ID Front"
              />
              <ImagePreview
                src={kyc.governmentIdBackImage}
                alt="Government ID Back"
                label="ID Back"
              />
              <ImagePreview
                src={kyc.selfieWithIdImage}
                alt="Selfie with ID"
                label="Selfie with ID"
              />
              <ImagePreview
                src={kyc.proofOfBillingImage}
                alt="Proof of Billing"
                label="Proof of Billing"
              />
            </div>
          </div>

          {/* Submission Info */}
          {kyc.createdAt && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Submitted on:{' '}
                {new Date(kyc.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}

          {/* Actions for rejected status */}
          {kyc.status === 'rejected' && (
            <div className="pt-4 border-t">
              <Link href="/user-profile/verify">
                <Button className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Submit New Application
                </Button>
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KYCApplicationViewer;
