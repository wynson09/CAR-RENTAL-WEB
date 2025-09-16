import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { carCategories } from '@/data/car-listings-data';
import { ArrayInput } from '@/components/ui/array-input';
import { ImageUpload } from '@/components/ui/image-upload';
import { PromoToggle } from '@/components/ui/promo-toggle';
import { type CarListing } from './types';

interface CarDetailsDialogProps {
  car: CarListing;
  onUpdateCar: (car: CarListing) => void;
}

export const CarDetailsDialog = ({ car, onUpdateCar }: CarDetailsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editedCar, setEditedCar] = useState<CarListing>(car);

  const handleSave = () => {
    onUpdateCar({ ...editedCar, updatedDate: new Date() });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Icon icon="heroicons:eye" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent size="2xl" className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Car Details - {car.name}</DialogTitle>
          <DialogDescription>View and edit car information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Car Image */}
          <div className="flex justify-center">
            <Image
              src={car.image || '/images/all-img/placeholder-car.jpg'}
              alt={car.name}
              width={500}
              height={192}
              className="w-full max-w-md h-48 object-cover rounded-lg"
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='192' viewBox='0 0 500 192'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239ca3af'%3ECar Details%3C/text%3E%3C/svg%3E"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Car Name</Label>
                <Input
                  id="name"
                  value={editedCar.name}
                  onChange={(e) => setEditedCar({ ...editedCar, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editedCar.category}
                  onValueChange={(value) => setEditedCar({ ...editedCar, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {carCategories
                      .filter((cat) => cat !== 'All')
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={editedCar.price}
                  onChange={(e) => setEditedCar({ ...editedCar, price: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="transmission">Transmission</Label>
                <Select
                  value={editedCar.transmission}
                  onValueChange={(value) => setEditedCar({ ...editedCar, transmission: value })}
                >
                  <SelectTrigger id="transmission">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="passengers">Passengers</Label>
                <Input
                  id="passengers"
                  value={editedCar.passengers}
                  onChange={(e) => setEditedCar({ ...editedCar, passengers: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bags">Bags</Label>
                <Input
                  id="bags"
                  value={editedCar.bags}
                  onChange={(e) => setEditedCar({ ...editedCar, bags: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="priorityLevel">Priority Level</Label>
                <Select
                  value={editedCar.priorityLevel.toString()}
                  onValueChange={(value) =>
                    setEditedCar({
                      ...editedCar,
                      priorityLevel: parseInt(value) as 1 | 2 | 3 | 4 | 5,
                    })
                  }
                >
                  <SelectTrigger id="priorityLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Low</SelectItem>
                    <SelectItem value="2">2 - Below Average</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="5">5 - Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <PromoToggle
            value={editedCar.isPromo}
            onChange={(checked) => setEditedCar({ ...editedCar, isPromo: checked })}
          />

          {/* Additional Information */}
          <div className="space-y-4">
            <ArrayInput
              label="Color Variants"
              value={editedCar.colorVariant}
              onChange={(colors) => setEditedCar({ ...editedCar, colorVariant: colors })}
              placeholder="Add color (e.g., #FF0000, #0000FF)"
              maxItems={10}
              type="color"
            />

            <ArrayInput
              label="Features"
              value={editedCar.features}
              onChange={(features) => setEditedCar({ ...editedCar, features })}
              placeholder="Add feature (e.g., GPS Navigation, Bluetooth)"
              maxItems={15}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Car Image</label>
              <ImageUpload
                onImageUpload={(url) => setEditedCar({ ...editedCar, image: url })}
                currentUserId="car-admin"
                storagePath="car-images"
                className="w-full"
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span> {format(car.createdDate, 'PPP')}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {format(car.updatedDate, 'PPP')}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
