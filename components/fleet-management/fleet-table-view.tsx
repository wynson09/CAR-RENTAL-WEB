import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { format } from 'date-fns';
import Image from 'next/image';
import { type FleetTableViewProps } from './types';
import { FleetDetailsDialog } from './fleet-details-dialog';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'rented':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'reserved':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'maintenance':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'retired':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

export const FleetTableView = ({
  vehicles,
  selectedVehicles,
  onSelectVehicle,
  onSelectAll,
  onDeleteVehicle,
  onUpdateVehicle,
  loading,
}: FleetTableViewProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={vehicles.length > 0 && selectedVehicles.length === vehicles.length}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Daily Rate</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Condition</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow key={vehicle.id}>
            <TableCell>
              <Checkbox
                checked={selectedVehicles.includes(vehicle.id)}
                onCheckedChange={() => onSelectVehicle(vehicle.id)}
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                {vehicle.carDetails.image ? (
                  <Image
                    src={vehicle.carDetails.image}
                    alt={`${vehicle.carDetails.make} ${vehicle.carDetails.model}`}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-50"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%239ca3af'%3ECar%3C/text%3E%3C/svg%3E"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <Icon icon="heroicons:truck" className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {vehicle.carDetails.make} {vehicle.carDetails.model} {vehicle.carDetails.year}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.carDetails.plateNumber} • {vehicle.carDetails.color}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{vehicle.ownerName}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    vehicle.ownerType === 'nacs'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  )}
                >
                  {vehicle.ownerType === 'nacs' ? 'NACS' : 'Partner'}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{vehicle.specifications.category}</Badge>
            </TableCell>
            <TableCell className="font-medium">
              {vehicle.pricing.currency} {vehicle.pricing.dailyRate.toLocaleString()}/day
            </TableCell>
            <TableCell>
              {vehicle.specifications.passengers} • {vehicle.specifications.bags}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={getStatusColor(vehicle.status.availability)}>
                {vehicle.status.availability}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={getConditionColor(vehicle.status.condition)}>
                {vehicle.status.condition.replace('_', ' ')}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {format(vehicle.updatedAt, 'MMM dd, yyyy')}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
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
                        <Icon icon="heroicons:arrow-path" className="h-4 w-4 animate-spin" />
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
                        {vehicle.carDetails.model} ({vehicle.carDetails.plateNumber})"? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={loading.deletingVehicles.includes(vehicle.id)}>
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
