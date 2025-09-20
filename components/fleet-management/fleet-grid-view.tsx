import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { type FleetViewProps } from './types';
import { FleetDetailsDialog } from './fleet-details-dialog';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-600';
    case 'rented':
      return 'bg-blue-600';
    case 'reserved':
      return 'bg-yellow-600';
    case 'maintenance':
      return 'bg-orange-600';
    case 'retired':
      return 'bg-gray-600';
    default:
      return 'bg-gray-600';
  }
};

const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'excellent':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'good':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'fair':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'needs_repair':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const FleetGridView = ({
  vehicles,
  selectedVehicles,
  onSelectVehicle,
  onDeleteVehicle,
  onUpdateVehicle,
  loading,
}: FleetViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {vehicles.map((vehicle) => (
        <div key={vehicle.id} className="relative group">
          <Card
            className={cn(
              'transition-all duration-200 hover:shadow-lg',
              selectedVehicles.includes(vehicle.id) && 'ring-2 ring-primary'
            )}
          >
            <CardContent className="p-0">
              {/* Vehicle Icon/Image */}
              <div className="relative">
                {vehicle.carDetails.image ? (
                  <Image
                    src={vehicle.carDetails.image}
                    alt={`${vehicle.carDetails.make} ${vehicle.carDetails.model}`}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-t-lg"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='192' viewBox='0 0 400 192'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239ca3af'%3EVehicle Image%3C/text%3E%3C/svg%3E"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
                    <Icon icon="heroicons:truck" className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}

                {/* Owner Type Badge */}
                <Badge
                  className={cn(
                    'absolute top-2 left-2',
                    vehicle.ownerType === 'nacs' ? 'bg-blue-600' : 'bg-purple-600'
                  )}
                >
                  {vehicle.ownerType === 'nacs' ? 'NACS' : 'Partner'}
                </Badge>

                {/* Status Badge */}
                <Badge
                  className={cn(
                    'absolute top-2 right-2',
                    getStatusColor(vehicle.status.availability)
                  )}
                >
                  {vehicle.status.availability}
                </Badge>

                {/* Selection Checkbox */}
                <Checkbox
                  className="absolute bottom-2 left-2 bg-white border-gray-300"
                  checked={selectedVehicles.includes(vehicle.id)}
                  onCheckedChange={() => onSelectVehicle(vehicle.id)}
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg leading-tight">
                      {vehicle.carDetails.make} {vehicle.carDetails.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.carDetails.year} • {vehicle.carDetails.plateNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{vehicle.specifications.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {vehicle.specifications.transmission}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon icon="heroicons:user-group" className="h-4 w-4" />
                      {vehicle.specifications.passengers}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon icon="heroicons:briefcase" className="h-4 w-4" />
                      {vehicle.specifications.bags}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon icon="heroicons:cog-6-tooth" className="h-4 w-4" />
                      {vehicle.specifications.fuelType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon icon="heroicons:wrench-screwdriver" className="h-4 w-4" />
                      <Badge
                        variant="outline"
                        className={cn('text-xs', getConditionColor(vehicle.status.condition))}
                      >
                        {vehicle.status.condition.replace('_', ' ')}
                      </Badge>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Owner: <span className="font-medium">{vehicle.ownerName}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-bold text-primary">
                        {vehicle.pricing.currency} {vehicle.pricing.dailyRate.toLocaleString()}/day
                      </span>
                      <div className="flex items-center gap-1">
                        <FleetDetailsDialog vehicle={vehicle} onUpdateVehicle={onUpdateVehicle} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              disabled={
                                loading.deletingVehicles.includes(vehicle.id) ||
                                loading.updatingVehicle === vehicle.id
                              }
                            >
                              {loading.deletingVehicles.includes(vehicle.id) ? (
                                <Icon
                                  icon="heroicons:arrow-path"
                                  className="h-4 w-4 animate-spin"
                                />
                              ) : (
                                <Icon icon="heroicons:trash" className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{vehicle.carDetails.make}{' '}
                                {vehicle.carDetails.model} ({vehicle.carDetails.plateNumber})"? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                disabled={loading.deletingVehicles.includes(vehicle.id)}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteVehicle(vehicle.id)}
                                className="bg-destructive hover:bg-destructive/80"
                                disabled={loading.deletingVehicles.includes(vehicle.id)}
                              >
                                {loading.deletingVehicles.includes(vehicle.id) ? (
                                  <>
                                    <Icon
                                      icon="heroicons:arrow-path"
                                      className="h-4 w-4 mr-2 animate-spin"
                                    />
                                    Deleting...
                                  </>
                                ) : (
                                  'Delete'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};
