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
import {
  FileText,
  RotateCcw,
  CheckCircle,
  XCircle,
  User,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Globe,
  Users,
} from 'lucide-react';
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
}

const KYCApplicationViewer: React.FC<KYCApplicationViewerProps> = ({
  user,
  verificationStatus,
}) => {
  const kyc = user?.kycRecord;
  if (!kyc || kyc.status === 'not_submitted') return null;

  const StatusIcon = verificationStatus.icon;

  const DocumentDisplay = ({
    src,
    label,
    icon: Icon,
  }: {
    src?: string;
    label: string;
    icon: React.ComponentType<any>;
  }) => {
    if (!src) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
          <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <span className="text-sm text-red-500 font-medium">Not Submitted</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="relative w-full h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
          <Image src={src} alt={label} fill className="object-cover" />
          {/* Status indicator overlay */}
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              Submitted
            </div>
          </div>
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <User className="w-4 h-4" />
                  First Name
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {user?.firstName || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <User className="w-4 h-4" />
                  Last Name
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {user?.lastName || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {user?.email || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Calendar className="w-4 h-4" />
                  Birth Date
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {kyc.birthDate || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Users className="w-4 h-4" />
                  Gender
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {kyc.gender || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Globe className="w-4 h-4" />
                  Nationality
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {kyc.nationality || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {kyc.phoneNumber || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <MapPin className="w-4 h-4" />
                  Address
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {kyc.address || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <MapPin className="w-4 h-4" />
                  City
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {kyc.city || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <MapPin className="w-4 h-4" />
                  State/Province
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {kyc.state || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <MapPin className="w-4 h-4" />
                  Zip Code
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {kyc.zipCode || 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          {/* ID Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              Identification
            </h3>

            {/* Basic ID Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  Government ID Type
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {kyc.governmentIdType || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  ID Number
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  {kyc.governmentId || 'Not provided'}
                </div>
              </div>
            </div>

            {/* Document Images */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 mb-4">Submitted Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DocumentDisplay
                  src={kyc.governmentIdFrontImage}
                  label="Government ID (Front)"
                  icon={CreditCard}
                />
                <DocumentDisplay
                  src={kyc.governmentIdBackImage}
                  label="Government ID (Back)"
                  icon={CreditCard}
                />
                <DocumentDisplay src={kyc.selfieWithIdImage} label="Selfie with ID" icon={User} />
                <DocumentDisplay
                  src={kyc.proofOfBillingImage}
                  label="Proof of Billing"
                  icon={FileText}
                />
              </div>
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
