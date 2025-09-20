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
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let imageUrl = editedVehicle.carDetails.image;

      // Upload image if a file is selected
      if (selectedImageFile) {
        imageUrl = await uploadVehicleImage(selectedImageFile);
      }

      await onUpdateVehicle({
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isLoading) return; // Prevent canceling during loading
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
      <DialogContent
        className="max-w-5xl max-h-[95vh] overflow-y-auto"
        style={{ width: '98vw', maxWidth: '1400px' }}
      >
        <DialogHeader>
          <DialogTitle>Edit Vehicle Details</DialogTitle>
          <DialogDescription>
            Update vehicle information, specifications, and status. All changes will be saved to
            your fleet inventory.
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
                      value={editedVehicle.carDetails.make}
                      onChange={(e) =>
                        setEditedVehicle({
                          ...editedVehicle,
                          carDetails: { ...editedVehicle.carDetails, make: e.target.value },
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
                      value={editedVehicle.carDetails.model}
                      onChange={(e) =>
                        setEditedVehicle({
                          ...editedVehicle,
                          carDetails: { ...editedVehicle.carDetails, model: e.target.value },
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
                      value={editedVehicle.carDetails.year}
                      onChange={(e) =>
                        setEditedVehicle({
                          ...editedVehicle,
                          carDetails: {
                            ...editedVehicle.carDetails,
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
                      value={editedVehicle.carDetails.color}
                      onChange={(e) =>
                        setEditedVehicle({
                          ...editedVehicle,
                          carDetails: { ...editedVehicle.carDetails, color: e.target.value },
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
                    value={editedVehicle.carDetails.plateNumber}
                    onChange={(e) =>
                      setEditedVehicle({
                        ...editedVehicle,
                        carDetails: { ...editedVehicle.carDetails, plateNumber: e.target.value },
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
                    value={editedVehicle.ownerName}
                    onChange={(e) =>
                      setEditedVehicle({ ...editedVehicle, ownerName: e.target.value })
                    }
                    placeholder="Company or Partner Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerType" className="text-sm font-medium">
                    Owner Type *
                  </Label>
                  <Select
                    value={editedVehicle.ownerType}
                    onValueChange={(value: 'nacs' | 'partner') =>
                      setEditedVehicle({ ...editedVehicle, ownerType: value })
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
                    value={editedVehicle.ownerUuid}
                    onChange={(e) =>
                      setEditedVehicle({ ...editedVehicle, ownerUuid: e.target.value })
                    }
                    placeholder="Optional unique identifier"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Record Information</Label>
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{format(editedVehicle.createdAt, 'PPP')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">{format(editedVehicle.updatedAt, 'PPP')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Vehicle Image */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vehicle Image</Label>
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
                  value={editedVehicle.specifications.category}
                  onValueChange={(value) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      specifications: { ...editedVehicle.specifications, category: value },
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
                  value={editedVehicle.specifications.transmission}
                  onValueChange={(value) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      specifications: { ...editedVehicle.specifications, transmission: value },
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
                  value={editedVehicle.specifications.fuelType}
                  onValueChange={(value) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      specifications: { ...editedVehicle.specifications, fuelType: value },
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
                  placeholder="e.g., 5 Seaters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bags" className="text-sm font-medium">
                  Luggage Capacity *
                </Label>
                <Input
                  id="bags"
                  value={editedVehicle.specifications.bags}
                  onChange={(e) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      specifications: { ...editedVehicle.specifications, bags: e.target.value },
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
                  value={editedVehicle.specifications.engineSize || ''}
                  onChange={(e) =>
                    setEditedVehicle({
                      ...editedVehicle,
                      specifications: {
                        ...editedVehicle.specifications,
                        engineSize: e.target.value,
                      },
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
                        value={editedVehicle.pricing.dailyRate}
                        onChange={(e) =>
                          setEditedVehicle({
                            ...editedVehicle,
                            pricing: {
                              ...editedVehicle.pricing,
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
                      value={editedVehicle.status.availability}
                      onValueChange={(value: any) =>
                        setEditedVehicle({
                          ...editedVehicle,
                          status: { ...editedVehicle.status, availability: value },
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
                      value={editedVehicle.status.condition}
                      onValueChange={(value: any) =>
                        setEditedVehicle({
                          ...editedVehicle,
                          status: { ...editedVehicle.status, condition: value },
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
                      value={editedVehicle.status.notes || ''}
                      onChange={(e) =>
                        setEditedVehicle({
                          ...editedVehicle,
                          status: { ...editedVehicle.status, notes: e.target.value },
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
                  Saving Changes...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:check" className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
