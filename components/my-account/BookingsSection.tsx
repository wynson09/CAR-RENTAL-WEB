'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, Plus, Eye, History } from 'lucide-react';
import Link from 'next/link';

interface BookingsSectionProps {
  upcomingCount: number;
  pastCount: number;
  isLoading: boolean;
}

const BookingsSection: React.FC<BookingsSectionProps> = ({
  upcomingCount,
  pastCount,
  isLoading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Bookings Overview
        </CardTitle>
        <CardDescription>Quick glance at your rental history and upcoming trips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Upcoming Bookings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">Upcoming</h4>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {isLoading ? '—' : upcomingCount}
              </div>
              <p className="text-sm text-blue-700 mb-4">Active & upcoming rentals</p>
              <Link href="/active-rentals">
                <Button size="sm" variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Active
                </Button>
              </Link>
            </div>
          </div>

          {/* Past Bookings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-gray-900">Completed</h4>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {isLoading ? '—' : pastCount}
              </div>
              <p className="text-sm text-green-700 mb-4">Total completed rentals</p>
              <Link href="/previous-rentals">
                <Button size="sm" variant="outline" className="w-full">
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </Link>
            </div>
          </div>

          {/* New Booking CTA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" />
              <h4 className="font-medium text-gray-900">New Booking</h4>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-700 mb-4">Ready for your next adventure?</div>
              <Link href="/start-a-booking">
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Booking
                </Button>
              </Link>
              <div className="mt-3">
                <Link href="/dashboard" className="text-xs text-purple-600 hover:underline">
                  Browse available cars
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Preview */}
        {(upcomingCount > 0 || pastCount > 0) && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {upcomingCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>
                    You have {upcomingCount} active booking{upcomingCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {pastCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    {pastCount} rental{pastCount > 1 ? 's' : ''} completed successfully
                  </span>
                </div>
              )}
              {upcomingCount === 0 && pastCount === 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>No rental history yet - start your first booking!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsSection;
