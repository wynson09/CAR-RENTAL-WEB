import { useState } from 'react';
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
import { carCategories } from '@/data/car-listings-data';
import { ArrayInput } from '@/components/ui/array-input';
import { ImageUpload } from '@/components/ui/image-upload';
import { PromoToggle } from '@/components/ui/promo-toggle';
import { type CarListing } from './types';

interface AddCarDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCar: (car: Omit<CarListing, 'id'>) => void;
  isLoading: boolean;
}

export const AddCarDialog = ({ isOpen, onOpenChange, onAddCar, isLoading }: AddCarDialogProps) => {
  const [newCar, setNewCar] = useState<Omit<CarListing, 'id'>>({
    isPromo: false,
    colorVariant: [],
    priorityLevel: 3,
    name: '',
    image: '',
    price: '',
    category: 'Sedan',
    passengers: '',
    bags: '',
    transmission: 'Automatic',
    features: [],
    createdDate: new Date(),
    updatedDate: new Date(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCar(newCar);

    // Reset form
    setNewCar({
      isPromo: false,
      colorVariant: [],
      priorityLevel: 3,
      name: '',
      image: '',
      price: '',
      category: 'Sedan',
      passengers: '',
      bags: '',
      transmission: 'Automatic',
      features: [],
      createdDate: new Date(),
      updatedDate: new Date(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Icon icon="heroicons:plus" className="h-4 w-4 mr-2" />
          Add Car
        </Button>
      </DialogTrigger>
      <DialogContent size="2xl" className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Car</DialogTitle>
          <DialogDescription>Enter the details for the new car listing</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-name">Car Name *</Label>
                <Input
                  id="new-name"
                  value={newCar.name}
                  onChange={(e) => setNewCar({ ...newCar, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="new-category">Category</Label>
                <Select
                  value={newCar.category}
                  onValueChange={(value) => setNewCar({ ...newCar, category: value })}
                >
                  <SelectTrigger id="new-category">
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
                <Label htmlFor="new-price">Price *</Label>
                <Input
                  id="new-price"
                  value={newCar.price}
                  onChange={(e) => setNewCar({ ...newCar, price: e.target.value })}
                  placeholder="₱2,500/day"
                  required
                />
              </div>

              <div>
                <Label htmlFor="new-transmission">Transmission</Label>
                <Select
                  value={newCar.transmission}
                  onValueChange={(value) => setNewCar({ ...newCar, transmission: value })}
                >
                  <SelectTrigger id="new-transmission">
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
                <Label htmlFor="new-passengers">Passengers *</Label>
                <Input
                  id="new-passengers"
                  value={newCar.passengers}
                  onChange={(e) => setNewCar({ ...newCar, passengers: e.target.value })}
                  placeholder="5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="new-bags">Bags *</Label>
                <Input
                  id="new-bags"
                  value={newCar.bags}
                  onChange={(e) => setNewCar({ ...newCar, bags: e.target.value })}
                  placeholder="4"
                  required
                />
              </div>

              <div>
                <Label htmlFor="new-priorityLevel">Priority Level</Label>
                <Select
                  value={newCar.priorityLevel.toString()}
                  onValueChange={(value) =>
                    setNewCar({ ...newCar, priorityLevel: parseInt(value) as 1 | 2 | 3 | 4 | 5 })
                  }
                >
                  <SelectTrigger id="new-priorityLevel">
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
            value={newCar.isPromo}
            onChange={(checked) => setNewCar({ ...newCar, isPromo: checked })}
          />

          {/* Additional Information */}
          <div className="space-y-4">
            <ArrayInput
              label="Color Variants"
              value={newCar.colorVariant}
              onChange={(colors) => setNewCar({ ...newCar, colorVariant: colors })}
              placeholder="Add color (e.g., #FF0000, #0000FF)"
              maxItems={10}
              type="color"
            />

            <ArrayInput
              label="Features"
              value={newCar.features}
              onChange={(features) => setNewCar({ ...newCar, features })}
              placeholder="Add feature (e.g., GPS Navigation, Bluetooth)"
              maxItems={15}
            />

            <ImageUpload
              label="Car Image"
              value={newCar.image}
              onChange={(url) => setNewCar({ ...newCar, image: url })}
              folder="car-images"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icon icon="heroicons:arrow-path" className="h-4 w-4 mr-2 animate-spin" />
                  Adding Car...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:plus" className="h-4 w-4 mr-2" />
                  Add Car
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
