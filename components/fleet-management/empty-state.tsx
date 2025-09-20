import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

interface EmptyStateProps {
  onAddVehicle: () => void;
}

export const EmptyState = ({ onAddVehicle }: EmptyStateProps) => {
  return (
    <Card>
      <CardContent className="p-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <Icon icon="heroicons:truck" className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No vehicles in fleet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start building your fleet inventory by adding your first vehicle. You can add both
              company-owned and partner vehicles.
            </p>
          </div>
          <div className="pt-4">
            <Button onClick={onAddVehicle}>
              <Icon icon="heroicons:plus" className="h-4 w-4 mr-2" />
              Add First Vehicle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
