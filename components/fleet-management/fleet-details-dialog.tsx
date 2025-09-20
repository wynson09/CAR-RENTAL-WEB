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
import { Textarea } from '@/components/ui/textarea';
import { VehicleImageUpload } from './vehicle-image-upload-v2';
import { uploadVehicleImage } from '@/lib/image-upload-utils';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { type FleetVehicle } from './types';

interface FleetDetailsDialogProps {
  vehicle: FleetVehicle;
  onUpdateVehicle: (vehicle: FleetVehicle) => void;
}

const availabilityOptions = ['available', 'rented', 'reserved', 'maintenance', 'retired'];
const conditionOptions = ['excellent', 'good', 'fair', 'needs_repair'];
const categoryOptions = ['SUV', 'Sedan', 'MPV', 'Van', 'Pickup', 'Hatchback'];
const transmissionOptions = ['Automatic', 'Manual', 'CVT'];
const fuelTypeOptions = ['Gasoline', 'Diesel', 'Hybrid', 'Electric'];

export const FleetDetailsDialog = ({ vehicle, onUpdateVehicle }: FleetDetailsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState<FleetVehicle>(vehicle);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const handleSave = async () => {
    try {
      let imageUrl = editedVehicle.carDetails.image;

      // Upload image if a file is selected
      if (selectedImageFile) {
        imageUrl = await uploadVehicleImage(selectedImageFile);
      }

      onUpdateVehicle({
        ...editedVehicle,
        carDetails: {
          ...editedVehicle.carDetails,
          image: imageUrl,
        },
        updatedAt: new Date(),
      });

      setSelectedImageFile(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      // Error handling will be done by the parent component
    }
  };

  const handleCancel = () => {
    setEditedVehicle(vehicle);
    setSelectedImageFile(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Icon icon="heroicons:eye" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vehicle Details</DialogTitle>
          <DialogDescription>
            View and edit vehicle information, specifications, and status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vehicle Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={editedVehicle.carDetails.make}
                    onChange={(e) =>
                      setEditedVehicle({
                        ...editedVehicle,
                        carDetails: { ...editedVehicle.carDetails, make: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={editedVehicle.carDetails.model}
                    onChange={(e) =>
                      setEditedVehicle({
                        ...editedVehicle,
                        carDetails: { ...editedVehicle.carDetails, model: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={editedVehicle.carDetails.year}
                    onChange={(e) =>
                      setEditedVehicle({
                        ...editedVehicle,
                        carDetails: { ...editedVehicle.carDetails, year: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plateNumber">Plate Number</Label>
                  <Input
                    id="plateNumber"
                    value={editedVehicle.carDetails.plateNumber}
                    onChange={(e) =>
                      setEditedVehicle({
                        ...editedVehicle,
                        carDetails: { ...editedVehicle.carDetails, plateNumber: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={editedVehicle.carDetails.color}
                  onChange={(e) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      carDetails: { ...editedVehicle.carDetails, color: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Vehicle Image</Label>
                <VehicleImageUpload
                  value={editedVehicle.carDetails.image || ''}
                  file={selectedImageFile}
                  onChange={(url) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      carDetails: { ...editedVehicle.carDetails, image: url },
                    })
                  }
                  onFileSelect={setSelectedImageFile}
                  onRemove={() => {
                    setEditedVehicle({
                      ...editedVehicle,
                      carDetails: { ...editedVehicle.carDetails, image: '' },
                    });
                    setSelectedImageFile(null);
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Owner Information</h3>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={editedVehicle.ownerName}
                  onChange={(e) =>
                    setEditedVehicle({ ...editedVehicle, ownerName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerType">Owner Type</Label>
                <Select
                  value={editedVehicle.ownerType}
                  onValueChange={(value: 'nacs' | 'partner') =>
                    setEditedVehicle({ ...editedVehicle, ownerType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacs">NACS</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Current Status</Label>
                <div className="flex gap-2">
                  <Badge variant="outline">{editedVehicle.status.availability}</Badge>
                  <Badge variant="outline">{editedVehicle.status.condition}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Specifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editedVehicle.specifications.category}
                  onValueChange={(value) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      specifications: { ...editedVehicle.specifications, category: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select
                  value={editedVehicle.specifications.transmission}
                  onValueChange={(value) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      specifications: { ...editedVehicle.specifications, transmission: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissionOptions.map((transmission) => (
                      <SelectItem key={transmission} value={transmission}>
                        {transmission}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select
                  value={editedVehicle.specifications.fuelType}
                  onValueChange={(value) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      specifications: { ...editedVehicle.specifications, fuelType: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypeOptions.map((fuelType) => (
                      <SelectItem key={fuelType} value={fuelType}>
                        {fuelType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passengers">Passengers</Label>
                <Input
                  id="passengers"
                  value={editedVehicle.specifications.passengers}
                  onChange={(e) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      specifications: {
                        ...editedVehicle.specifications,
                        passengers: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bags">Luggage Capacity</Label>
                <Input
                  id="bags"
                  value={editedVehicle.specifications.bags}
                  onChange={(e) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      specifications: { ...editedVehicle.specifications, bags: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Pricing & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing</h3>

              <div className="space-y-2">
                <Label htmlFor="dailyRate">Daily Rate</Label>
                <Input
                  id="dailyRate"
                  type="number"
                  value={editedVehicle.pricing.dailyRate}
                  onChange={(e) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      pricing: { ...editedVehicle.pricing, dailyRate: parseFloat(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyRate">Monthly Rate (Optional)</Label>
                <Input
                  id="monthlyRate"
                  type="number"
                  value={editedVehicle.pricing.monthlyRate || ''}
                  onChange={(e) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      pricing: {
                        ...editedVehicle.pricing,
                        monthlyRate: e.target.value ? parseFloat(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status</h3>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select
                  value={editedVehicle.status.availability}
                  onValueChange={(value: any) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      status: { ...editedVehicle.status, availability: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={editedVehicle.status.condition}
                  onValueChange={(value: any) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      status: { ...editedVehicle.status, condition: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editedVehicle.status.notes || ''}
                  onChange={(e) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      status: { ...editedVehicle.status, notes: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span> {format(vehicle.createdAt, 'PPpp')}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {format(vehicle.updatedAt, 'PPpp')}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
