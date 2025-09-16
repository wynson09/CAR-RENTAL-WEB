'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  FileText,
  Bell,
  Calendar,
  LifeBuoy,
  User2,
  Shield,
  Settings,
  HelpCircle,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const QuickActions: React.FC = () => {
  const ActionCard = ({
    title,
    description,
    href,
    icon: Icon,
    color = 'default',
  }: {
    title: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: 'default' | 'blue' | 'green' | 'purple';
  }) => {
    const colorClasses = {
      default: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    };

    const iconColorClasses = {
      default: 'text-gray-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
    };

    return (
      <Link href={href} className="block">
        <div
          className={`p-4 rounded-lg border transition-colors cursor-pointer ${colorClasses[color]}`}
        >
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 mt-0.5 ${iconColorClasses[color]}`} />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      {/* Payment & Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment & Billing
          </CardTitle>
          <CardDescription>
            Manage your payment methods and view transaction history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ActionCard
            title="Payment Methods"
            description="Add, remove, or update your cards and payment options"
            href="/billing/payment-methods"
            icon={CreditCard}
            color="blue"
          />
          <ActionCard
            title="Transaction History"
            description="View invoices, receipts, and payment records"
            href="/invoice-list"
            icon={FileText}
            color="green"
          />
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Account Settings
          </CardTitle>
          <CardDescription>Manage your account preferences and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ActionCard
            title="Profile Settings"
            description="Update personal information, avatar, and contact details"
            href="/user-profile"
            icon={User2}
            color="default"
          />
          <ActionCard
            title="Security & Privacy"
            description="Change password, enable 2FA, and privacy settings"
            href="/user-profile/settings"
            icon={Shield}
            color="purple"
          />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications & Alerts
          </CardTitle>
          <CardDescription>Stay updated with important reminders and offers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ActionCard
            title="Return Reminders"
            description="Get notified about upcoming car return deadlines"
            href="/active-rentals"
            icon={Calendar}
            color="blue"
          />
          <ActionCard
            title="Payment Alerts"
            description="Monitor pending payments and failed transactions"
            href="/invoice-list"
            icon={Bell}
            color="default"
          />
        </CardContent>
      </Card>

      {/* Support & Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary" />
            Support & Help
          </CardTitle>
          <CardDescription>Get assistance when you need it most</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ActionCard
            title="Contact Support"
            description="Chat with our support team or call our hotline"
            href="/support-chat"
            icon={MessageCircle}
            color="green"
          />
          <ActionCard
            title="Help Center & FAQs"
            description="Find answers to common questions and guides"
            href="/react-email"
            icon={HelpCircle}
            color="blue"
          />
          <ActionCard
            title="Report an Issue"
            description="Submit a support ticket for technical problems"
            href="/enhanced-chat"
            icon={LifeBuoy}
            color="default"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;
