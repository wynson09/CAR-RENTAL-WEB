import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
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
import { type CarViewProps } from './types';
import { CarDetailsDialog } from './car-details-dialog';

export const CarGridView = ({
  cars,
  selectedCars,
  onSelectCar,
  onDeleteCar,
  onUpdateCar,
  loading,
}: CarViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {cars.map((car) => (
        <div key={car.id} className="relative group">
          <Card
            className={cn(
              'transition-all duration-200 hover:shadow-lg',
              selectedCars.includes(car.id) && 'ring-2 ring-primary'
            )}
          >
            <CardContent className="p-0">
              {/* Image */}
              <div className="relative">
                <Image
                  src={car.image || '/images/all-img/comming-soon.png'}
                  alt={car.name}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover rounded-t-lg"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='192' viewBox='0 0 400 192'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239ca3af'%3ECar Image%3C/text%3E%3C/svg%3E"
                />
                {car.isPromo && <Badge className="absolute top-2 left-2 bg-blue-600">Promo</Badge>}
                <Badge
                  className={cn(
                    'absolute top-2 right-2',
                    car.priorityLevel === 5 && 'bg-red-600',
                    car.priorityLevel === 4 && 'bg-orange-600',
                    car.priorityLevel === 3 && 'bg-yellow-600',
                    car.priorityLevel <= 2 && 'bg-green-600'
                  )}
                >
                  P{car.priorityLevel}
                </Badge>
                <Checkbox
                  className="absolute bottom-2 left-2 bg-white border-gray-300"
                  checked={selectedCars.includes(car.id)}
                  onCheckedChange={() => onSelectCar(car.id)}
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg leading-tight">{car.name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{car.category}</Badge>
                    <span className="text-sm text-muted-foreground">{car.transmission}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon icon="heroicons:user-group" className="h-4 w-4" />
                      {car.passengers}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon icon="heroicons:briefcase" className="h-4 w-4" />
                      {car.bags}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-primary">{car.price}</span>
                    <div className="flex items-center gap-1">
                      <CarDetailsDialog car={car} onUpdateCar={onUpdateCar} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={
                              loading.deletingCars.includes(car.id) ||
                              loading.updatingCar === car.id
                            }
                          >
                            {loading.deletingCars.includes(car.id) ? (
                              <Icon icon="heroicons:arrow-path" className="h-4 w-4 animate-spin" />
                            ) : (
                              <Icon icon="heroicons:trash" className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Car</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{car.name}"? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={loading.deletingCars.includes(car.id)}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteCar(car.id)}
                              className="bg-destructive hover:bg-destructive/80"
                              disabled={loading.deletingCars.includes(car.id)}
                            >
                              {loading.deletingCars.includes(car.id) ? (
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
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};
