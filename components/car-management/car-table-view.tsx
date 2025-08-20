import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { type CarTableViewProps } from "./types";
import { CarDetailsDialog } from "./car-details-dialog";

export const CarTableView = ({ 
  cars, 
  selectedCars, 
  onSelectCar, 
  onSelectAll, 
  onDeleteCar, 
  onUpdateCar,
  loading
}: CarTableViewProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={cars.length > 0 && selectedCars.length === cars.length}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead>Car</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cars.map((car) => (
          <TableRow key={car.id}>
            <TableCell>
              <Checkbox
                checked={selectedCars.includes(car.id)}
                onCheckedChange={() => onSelectCar(car.id)}
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <img 
                  src={car.image} 
                  alt={car.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/all-img/comming-soon.png';
                  }}
                />
                <div>
                  <p className="font-medium">{car.name}</p>
                  <p className="text-sm text-muted-foreground">{car.transmission}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{car.category}</Badge>
            </TableCell>
            <TableCell className="font-medium">{car.price}</TableCell>
            <TableCell>{car.passengers} passengers • {car.bags} bags</TableCell>
            <TableCell>
              <Badge 
                variant={car.priorityLevel >= 4 ? "outline" : "soft"}
                className={cn(
                  car.priorityLevel === 5 && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                  car.priorityLevel === 4 && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
                  car.priorityLevel === 3 && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                  car.priorityLevel <= 2 && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                )}
              >
                P{car.priorityLevel}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {car.isPromo && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Promo
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {format(car.updatedDate, "MMM dd, yyyy")}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <CarDetailsDialog car={car} onUpdateCar={onUpdateCar} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      disabled={loading.deletingCars.includes(car.id) || loading.updatingCar === car.id}
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
                        Are you sure you want to delete "{car.name}"? This action cannot be undone.
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
                            <Icon icon="heroicons:arrow-path" className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
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
