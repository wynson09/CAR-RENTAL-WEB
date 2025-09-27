'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const NextSteps = () => {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="text-blue-800 dark:text-blue-200">What Happens Next?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Review & Approval</p>
              <p className="text-blue-600 dark:text-blue-300 text-sm">
                Our team will promptly review your booking request, typically within 30 minutes to 2
                hours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Confirmation</p>
              <p className="text-blue-600 dark:text-blue-300 text-sm">
                You will receive a text message or phone call with the vehicle details and pickup
                instructions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Vehicle Pickup</p>
              <p className="text-blue-600 dark:text-blue-300 text-sm">
                Present your valid driver's license and make payment at pickup location
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
