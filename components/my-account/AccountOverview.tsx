'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { UserData } from '@/store';

interface AccountOverviewProps {
  user: UserData;
  verificationStatus: {
    isVerified: boolean;
    kycStatus: string;
  };
}

const AccountOverview: React.FC<AccountOverviewProps> = ({ user, verificationStatus }) => {
  const { isVerified, kycStatus } = verificationStatus;

  const getVerificationAlert = () => {
    if (isVerified) {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Account Verified ✅</AlertTitle>
          <AlertDescription className="text-green-700">
            You're all set! Enjoy your <span className="font-semibold">5% discount</span> on every
            rental and faster booking approval.
          </AlertDescription>
        </Alert>
      );
    }

    if (kycStatus === 'pending') {
      return (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Verification Under Review</AlertTitle>
          <AlertDescription className="text-blue-700">
            Your verification application is being reviewed. We'll notify you once it's approved.
            This usually takes 1-2 business days.
          </AlertDescription>
        </Alert>
      );
    }

    if (kycStatus === 'rejected') {
      return (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Verification Rejected</AlertTitle>
          <AlertDescription className="text-red-700">
            Your verification was rejected. Please review the feedback and submit a new application
            with correct documents.
            {user?.kycRecord?.statusMessage && (
              <div className="mt-2 p-2 bg-red-100 rounded text-sm">
                <strong>Reason:</strong> {user.kycRecord.statusMessage}
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Account Not Verified</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Complete your account verification to unlock member benefits including a{' '}
          <span className="font-semibold">5% discount</span> on all rentals and priority support.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Account Status & Benefits
        </CardTitle>
        <CardDescription>Your verification status and member benefits overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {getVerificationAlert()}

        {/* Benefits Overview */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Current Benefits</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Booking Access</span>
                <span className="text-green-600 font-medium">✓ Available</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Customer Support</span>
                <span className="text-green-600 font-medium">✓ Standard</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Priority Booking</span>
                <span className={isVerified ? 'text-green-600 font-medium' : 'text-gray-400'}>
                  {isVerified ? '✓ Enabled' : '✗ Standard Queue'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Account Security</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Email Verified</span>
                <span className="text-green-600 font-medium">✓ Verified</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Identity Verified</span>
                <span className={isVerified ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                  {isVerified ? '✓ Verified' : '⏳ Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Account Protection</span>
                <span className="text-green-600 font-medium">✓ Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {!isVerified && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-3">Next Steps</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {kycStatus === 'not_submitted' && (
                <>
                  <div>• Complete account verification to unlock all benefits</div>
                  <div>• Upload government ID and proof of billing</div>
                  <div>• Get instant 5% discount on all future rentals</div>
                </>
              )}
              {kycStatus === 'pending' && (
                <>
                  <div>• Wait for verification review (1-2 business days)</div>
                  <div>• Check your email for updates</div>
                  <div>• Benefits will activate once approved</div>
                </>
              )}
              {kycStatus === 'rejected' && (
                <>
                  <div>• Review rejection feedback carefully</div>
                  <div>• Prepare new documents with clear images</div>
                  <div>• Resubmit verification application</div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountOverview;
