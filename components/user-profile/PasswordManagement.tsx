'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PasswordManagementProps {
  authProvider: string;
}

const PasswordManagement: React.FC<PasswordManagementProps> = ({ authProvider }) => {
  if (authProvider === 'email') {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            You can update your password anytime. Make sure it's strong and unique to keep your
            account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/user-profile/settings">
            <Button className="w-full sm:w-auto">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (authProvider === 'google') {
    return (
      <Card className="h-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Password Management
          </CardTitle>
          <CardDescription>
            Your account is linked to Google. To change your password, please update it in your
            Google Account settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full sm:w-auto" variant="outline">
            <a
              href="https://myaccount.google.com/security"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage Google Account
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (authProvider === 'facebook') {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Password Management
          </CardTitle>
          <CardDescription>
            Your account is linked to Facebook. To change your password, please update it in your
            Facebook Account settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full sm:w-auto" variant="outline">
            <a
              href="https://www.facebook.com/settings?tab=security"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage Facebook Account
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default PasswordManagement;
