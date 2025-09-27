'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface SuccessHeaderProps {
  bookingId: string;
}

export const SuccessHeader = ({ bookingId }: SuccessHeaderProps) => {
  return (
    <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
              Booking Successfully Submitted!
            </h1>
            <p className="text-green-600 dark:text-green-300 mt-2">
              Your car rental request has been received and is being processed.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Booking ID:</span>
            <Badge variant="outline" className="font-mono">
              {bookingId}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
