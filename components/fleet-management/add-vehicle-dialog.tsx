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
import { type FleetVehicle } from './types';

interface AddVehicleDialogProps {
  onAddVehicle: (vehicle: Omit<FleetVehicle, 'id'>) => void;
  isLoading?: boolean;
}

const categoryOptions = ['SUV', 'Sedan', 'MPV', 'Van', 'Pickup', 'Hatchback'];
const transmissionOptions = ['Automatic', 'Manual', 'CVT'];
const fuelTypeOptions = ['Gasoline', 'Diesel', 'Hybrid', 'Electric'];
const availabilityOptions = ['available', 'rented', 'reserved', 'maintenance', 'retired'];
const conditionOptions = ['excellent', 'good', 'fair', 'needs_repair'];

const initialVehicle: Omit<FleetVehicle, 'id'> = {
  createdAt: new Date(),
  updatedAt: new Date(),
  ownerUuid: '',
  ownerName: '',
  ownerType: 'nacs',
  carDetails: {
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    plateNumber: '',
    image: '',
  },
  specifications: {
    category: 'Sedan',
    passengers: '5 Seaters',
    bags: '3 Luggages',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    engineSize: '',
    features: [],
  },
  pricing: {
    dailyRate: 0,
    currency: 'PHP',
  },
  status: {
    availability: 'available',
    condition: 'excellent',
    notes: '',
  },
};

export const AddVehicleDialog = ({
  onAddVehicle,
  isLoading: externalLoading,
}: AddVehicleDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Omit<FleetVehicle, 'id'>>(initialVehicle);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isInternalLoading, setIsInternalLoading] = useState(false);

  // Combine external and internal loading states
  const isLoading = externalLoading || isInternalLoading;

  const handleSave = async () => {
    setIsInternalLoading(true);
    try {
      let imageUrl = newVehicle.carDetails.image;

      // Upload image if a file is selected
      if (selectedImageFile) {
        imageUrl = await uploadVehicleImage(selectedImageFile);
      }

      await onAddVehicle({
        ...newVehicle,
        carDetails: {
          ...newVehicle.carDetails,
          image: imageUrl,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Reset form
      setNewVehicle(initialVehicle);
      setSelectedImageFile(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      // Error handling will be done by the parent component
    } finally {
      setIsInternalLoading(false);
    }
  };

  const handleCancel = () => {
    if (isLoading) return; // Prevent canceling during loading
    setNewVehicle(initialVehicle);
    setSelectedImageFile(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon icon="heroicons:plus" className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-5xl max-h-[95vh] overflow-y-auto"
        style={{ width: '98vw', maxWidth: '1400px' }}
      >
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Add a new vehicle to your fleet inventory. Fill in all required information.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-8">
          {/* Basic Vehicle Details */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Icon icon="heroicons:truck" className="h-5 w-5 text-primary" />
                Vehicle Details
              </h3>
              <p className="text-sm text-gray-600 mt-1">Basic information about the vehicle</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="make" className="text-sm font-medium">
                      Make *
                    </Label>
                    <Input
                      id="make"
                      value={newVehicle.carDetails.make}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          carDetails: { ...newVehicle.carDetails, make: e.target.value },
                        })
                      }
                      placeholder="Toyota, Honda, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-sm font-medium">
                      Model *
                    </Label>
                    <Input
                      id="model"
                      value={newVehicle.carDetails.model}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          carDetails: { ...newVehicle.carDetails, model: e.target.value },
                        })
                      }
                      placeholder="Innova, Civic, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm font-medium">
                      Year *
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      value={newVehicle.carDetails.year}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          carDetails: {
                            ...newVehicle.carDetails,
                            year: parseInt(e.target.value) || new Date().getFullYear(),
                          },
                        })
                      }
                      min="1990"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color" className="text-sm font-medium">
                      Color *
                    </Label>
                    <Input
                      id="color"
                      value={newVehicle.carDetails.color}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          carDetails: { ...newVehicle.carDetails, color: e.target.value },
                        })
                      }
                      placeholder="White, Black, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plateNumber" className="text-sm font-medium">
                    Plate Number *
                  </Label>
                  <Input
                    id="plateNumber"
                    value={newVehicle.carDetails.plateNumber}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        carDetails: { ...newVehicle.carDetails, plateNumber: e.target.value },
                      })
                    }
                    placeholder="ABC-123"
                  />
                </div>
              </div>

              {/* Middle Column - Owner Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName" className="text-sm font-medium">
                    Owner Name *
                  </Label>
                  <Input
                    id="ownerName"
                    value={newVehicle.ownerName}
                    onChange={(e) => setNewVehicle({ ...newVehicle, ownerName: e.target.value })}
                    placeholder="Company or Partner Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerType" className="text-sm font-medium">
                    Owner Type *
                  </Label>
                  <Select
                    value={newVehicle.ownerType}
                    onValueChange={(value: 'nacs' | 'partner') =>
                      setNewVehicle({ ...newVehicle, ownerType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nacs">
                        <div className="flex items-center gap-2">
                          <Icon icon="heroicons:building-office" className="h-4 w-4" />
                          NACS (Company Owned)
                        </div>
                      </SelectItem>
                      <SelectItem value="partner">
                        <div className="flex items-center gap-2">
                          <Icon icon="heroicons:user-group" className="h-4 w-4" />
                          Partner Vehicle
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerUuid" className="text-sm font-medium">
                    Owner UUID
                  </Label>
                  <Input
                    id="ownerUuid"
                    value={newVehicle.ownerUuid}
                    onChange={(e) => setNewVehicle({ ...newVehicle, ownerUuid: e.target.value })}
                    placeholder="Optional unique identifier"
                  />
                </div>
              </div>

              {/* Right Column - Vehicle Image */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vehicle Image</Label>
                  <VehicleImageUpload
                    value={newVehicle.carDetails.image}
                    file={selectedImageFile}
                    onChange={(url) =>
                      setNewVehicle({
                        ...newVehicle,
                        carDetails: { ...newVehicle.carDetails, image: url },
                      })
                    }
                    onFileSelect={setSelectedImageFile}
                    onRemove={() => {
                      setNewVehicle({
                        ...newVehicle,
                        carDetails: { ...newVehicle.carDetails, image: '' },
                      });
                      setSelectedImageFile(null);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Specifications */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Icon icon="heroicons:cog-6-tooth" className="h-5 w-5 text-primary" />
                Vehicle Specifications
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Technical details and capacity information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <Select
                  value={newVehicle.specifications.category}
                  onValueChange={(value) =>
                    setNewVehicle({
                      ...newVehicle,
                      specifications: { ...newVehicle.specifications, category: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon={
                              category === 'SUV'
                                ? 'heroicons:truck'
                                : category === 'Sedan'
                                ? 'heroicons:rectangle-stack'
                                : category === 'MPV'
                                ? 'heroicons:squares-plus'
                                : category === 'Van'
                                ? 'heroicons:cube'
                                : category === 'Pickup'
                                ? 'heroicons:truck'
                                : 'heroicons:rectangle-stack'
                            }
                            className="h-4 w-4"
                          />
                          {category}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission" className="text-sm font-medium">
                  Transmission *
                </Label>
                <Select
                  value={newVehicle.specifications.transmission}
                  onValueChange={(value) =>
                    setNewVehicle({
                      ...newVehicle,
                      specifications: { ...newVehicle.specifications, transmission: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissionOptions.map((transmission) => (
                      <SelectItem key={transmission} value={transmission}>
                        <div className="flex items-center gap-2">
                          <Icon icon="heroicons:cog-8-tooth" className="h-4 w-4" />
                          {transmission}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType" className="text-sm font-medium">
                  Fuel Type *
                </Label>
                <Select
                  value={newVehicle.specifications.fuelType}
                  onValueChange={(value) =>
                    setNewVehicle({
                      ...newVehicle,
                      specifications: { ...newVehicle.specifications, fuelType: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypeOptions.map((fuelType) => (
                      <SelectItem key={fuelType} value={fuelType}>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon={
                              fuelType === 'Electric'
                                ? 'heroicons:bolt'
                                : fuelType === 'Hybrid'
                                ? 'heroicons:leaf'
                                : 'heroicons:fire'
                            }
                            className="h-4 w-4"
                          />
                          {fuelType}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passengers" className="text-sm font-medium">
                  Passengers *
                </Label>
                <Input
                  id="passengers"
                  value={newVehicle.specifications.passengers}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      specifications: { ...newVehicle.specifications, passengers: e.target.value },
                    })
                  }
                  placeholder="e.g., 5 Seaters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bags" className="text-sm font-medium">
                  Luggage Capacity *
                </Label>
                <Input
                  id="bags"
                  value={newVehicle.specifications.bags}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      specifications: { ...newVehicle.specifications, bags: e.target.value },
                    })
                  }
                  placeholder="e.g., 3 Luggages"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="engineSize" className="text-sm font-medium">
                  Engine Size
                </Label>
                <Input
                  id="engineSize"
                  value={newVehicle.specifications.engineSize || ''}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      specifications: { ...newVehicle.specifications, engineSize: e.target.value },
                    })
                  }
                  placeholder="e.g., 2.5L"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Status */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Icon icon="heroicons:currency-dollar" className="h-5 w-5 text-primary" />
                Pricing & Status
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Set rental rates and current vehicle status
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pricing Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Icon icon="heroicons:banknotes" className="h-4 w-4 text-green-600" />
                  Rental Pricing
                </h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate" className="text-sm font-medium">
                      Daily Rate (PHP) *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₱
                      </span>
                      <Input
                        id="dailyRate"
                        type="number"
                        value={newVehicle.pricing.dailyRate}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            pricing: {
                              ...newVehicle.pricing,
                              dailyRate: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        min="0"
                        step="100"
                        className="pl-8"
                        placeholder="2500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyRate" className="text-sm font-medium">
                      Monthly Rate (PHP)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₱
                      </span>
                      <Input
                        id="monthlyRate"
                        type="number"
                        value={newVehicle.pricing.monthlyRate || ''}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            pricing: {
                              ...newVehicle.pricing,
                              monthlyRate: e.target.value ? parseFloat(e.target.value) : undefined,
                            },
                          })
                        }
                        min="0"
                        step="1000"
                        className="pl-8"
                        placeholder="60000"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Optional - leave blank if not applicable
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Icon icon="heroicons:signal" className="h-4 w-4 text-blue-600" />
                  Vehicle Status
                </h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="availability" className="text-sm font-medium">
                      Availability *
                    </Label>
                    <Select
                      value={newVehicle.status.availability}
                      onValueChange={(value: any) =>
                        setNewVehicle({
                          ...newVehicle,
                          status: { ...newVehicle.status, availability: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  option === 'available'
                                    ? 'bg-green-500'
                                    : option === 'rented'
                                    ? 'bg-blue-500'
                                    : option === 'reserved'
                                    ? 'bg-yellow-500'
                                    : option === 'maintenance'
                                    ? 'bg-orange-500'
                                    : 'bg-gray-500'
                                }`}
                              />
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-sm font-medium">
                      Condition *
                    </Label>
                    <Select
                      value={newVehicle.status.condition}
                      onValueChange={(value: any) =>
                        setNewVehicle({
                          ...newVehicle,
                          status: { ...newVehicle.status, condition: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            <div className="flex items-center gap-2">
                              <Icon
                                icon={
                                  option === 'excellent'
                                    ? 'heroicons:star'
                                    : option === 'good'
                                    ? 'heroicons:check-circle'
                                    : option === 'fair'
                                    ? 'heroicons:exclamation-triangle'
                                    : 'heroicons:wrench-screwdriver'
                                }
                                className={`h-4 w-4 ${
                                  option === 'excellent'
                                    ? 'text-green-500'
                                    : option === 'good'
                                    ? 'text-blue-500'
                                    : option === 'fair'
                                    ? 'text-yellow-500'
                                    : 'text-red-500'
                                }`}
                              />
                              {option.replace('_', ' ').charAt(0).toUpperCase() +
                                option.replace('_', ' ').slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={newVehicle.status.notes || ''}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          status: { ...newVehicle.status, notes: e.target.value },
                        })
                      }
                      rows={3}
                      placeholder="Any additional notes about the vehicle, maintenance history, special features, etc."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="flex justify-between items-center gap-4 pt-6 border-t bg-gray-50/50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <div className="text-sm text-gray-600">
            <Icon icon="heroicons:information-circle" className="h-4 w-4 inline mr-1" />
            Fields marked with * are required
          </div>
          <div className="flex gap-3">
            <DialogClose asChild>
              <Button
                variant="outline"
                color="secondary"
                onClick={handleCancel}
                disabled={isLoading}
                className="min-w-[100px]"
              >
                <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </DialogClose>
            <Button
              color="primary"
              onClick={handleSave}
              disabled={isLoading}
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Icon icon="heroicons:arrow-path" className="h-4 w-4 mr-2 animate-spin" />
                  Adding Vehicle...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:plus" className="h-4 w-4 mr-2" />
                  Add Vehicle
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
