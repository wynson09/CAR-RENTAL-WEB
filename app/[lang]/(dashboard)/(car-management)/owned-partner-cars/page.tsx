'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

const OwnedPartnerCarsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Owned & Partner Cars</CardTitle>
              <p className="text-muted-foreground">
                Manage cars owned by the company and partner vehicles
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button disabled>
                <Icon icon="heroicons:plus" className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Section */}
      <Card>
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <Icon icon="heroicons:truck" className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                This page will contain functionality for managing owned company vehicles and partner
                car listings. Features will include inventory tracking, maintenance schedules, and
                partner agreements.
              </p>
            </div>
            <div className="pt-4">
              <Button variant="outline" disabled>
                <Icon icon="heroicons:wrench-screwdriver" className="h-4 w-4 mr-2" />
                Under Development
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnedPartnerCarsPage;
