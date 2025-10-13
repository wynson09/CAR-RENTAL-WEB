'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search,
  Car,
  User,
  Calendar,
  CheckCircle,
  Circle,
  Building,
  Gauge,
  Users,
  Luggage,
  MapPin,
} from 'lucide-react';
import { BookingFirebaseService, BookingData } from '@/lib/firebase-booking-service';
import { FleetVehicle } from '@/lib/firebase-fleet-service';
import { toast } from 'sonner';

interface VehicleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingData | null;
  fleetVehicles: FleetVehicle[];
  onVehicleAssigned: () => void;
}

export const VehicleAssignmentDialog: React.FC<VehicleAssignmentDialogProps> = ({
  open,
  onOpenChange,
  booking,
  fleetVehicles,
  onVehicleAssigned,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter available vehicles based on search and status
  const availableVehicles = fleetVehicles.filter((vehicle) => {
    const matchesSearch =
      searchTerm === '' ||
      vehicle.carDetails.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.carDetails.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.carDetails.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.carDetails.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase());

    // Only show available vehicles
    const isAvailable = vehicle.status.availability === 'available';

    return matchesSearch && isAvailable;
  });

  const handleAssignVehicle = async () => {
    if (!booking?.id || !selectedVehicleId) return;

    const selectedVehicle = fleetVehicles.find((v) => v.id === selectedVehicleId);
    if (!selectedVehicle) return;

    setLoading(true);

    try {
      const assignedVehicle = {
        vehicleId: selectedVehicle.id,
        plateNumber: selectedVehicle.carDetails.plateNumber,
        name: `${selectedVehicle.carDetails.make} ${selectedVehicle.carDetails.model}`,
      };

      // Update booking with assigned vehicle and status
      const updateData = {
        bookingDetails: {
          ...booking.bookingDetails,
          status: 'reserved' as const, // Update status to reserved when vehicle is assigned
        },
        assignedVehicle,
      };

      await BookingFirebaseService.updateBooking(booking.id, updateData);

      onVehicleAssigned();
      onOpenChange(false);
      setSelectedVehicleId(null);
      setSearchTerm('');
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      toast.error('Failed to assign vehicle');
    } finally {
      setLoading(false);
    }
  };

  const getOwnerBadgeColor = (ownerType: string) => {
    return ownerType === 'nacs' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  if (!booking) return null;

  // Reusable booking summary content for mobile/desktop
  const BookingSummaryContent = () => (
    <>
      <h3 className="font-semibold mb-4">Booking Summary</h3>
      <div className="space-y-3 text-sm">
        <div>
          <Label className="text-muted-foreground">Requested Vehicle</Label>
          <p className="font-medium">{booking.selectedVehicles.name}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Destination</Label>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <span>{booking.bookingDetails.destination}</span>
              {booking.bookingDetails.withInZDS && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Within ZDS - ₱200 off
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <Label className="text-muted-foreground">Duration</Label>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{booking.selectedVehicles.totalDuration} days</span>
          </div>
        </div>
        <div>
          <Label className="text-muted-foreground">Dates</Label>
          <p>
            {new Date(booking.bookingDetails.pickUpDate).toLocaleDateString()} to{' '}
            {new Date(booking.bookingDetails.returnDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <Label className="text-muted-foreground">Drive Option</Label>
          <p className="capitalize">{booking.bookingDetails.driveOption.replace('-', ' ')}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Customer</Label>
          <p>
            {booking.renterInformation.firstName} {booking.renterInformation.lastName}
          </p>
        </div>
        <div>
          <Label className="text-muted-foreground">Total Amount</Label>
          <p className="font-medium text-lg">
            {formatCurrency(booking.selectedVehicles.totalAmount)}
          </p>
        </div>
      </div>

      {booking.assignedVehicle && (
        <>
          <Separator className="my-4" />
          <div>
            <Label className="text-muted-foreground">Currently Assigned</Label>
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{booking.assignedVehicle.name}</p>
                  <p className="text-sm text-green-600">{booking.assignedVehicle.plateNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl max-h-[90vh] overflow-y-auto lg:overflow-hidden"
        style={{ width: '98vw', maxWidth: '1400px' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Assign Vehicle to Booking - {booking.id?.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        {/* Mobile: collapsible booking summary */}
        <div className="lg:hidden">
          <Accordion type="single" collapsible defaultValue="summary">
            <AccordionItem value="summary">
              <AccordionTrigger className="px-2 py-3">Booking Summary</AccordionTrigger>
              <AccordionContent className="px-2">
                <Card className="shadow-none border">
                  <CardContent className="p-4">
                    <BookingSummaryContent />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 lg:h-[70vh]">
          {/* Booking Summary */}
          <Card className="lg:col-span-1 hidden lg:block">
            <CardContent className="p-4">
              <BookingSummaryContent />
            </CardContent>
          </Card>

          {/* Vehicle Selection */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            {/* Search (sticky on mobile) */}
            <div className="mb-3 lg:mb-4 sticky top-0 z-10 bg-background pt-3 pb-3 -mx-4 px-4 lg:static lg:pt-0 lg:pb-0 lg:px-0">
              <Label htmlFor="search">Search Available Vehicles</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by make, model, color, plate number, or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 lg:h-11"
                />
              </div>
            </div>

            {/* Vehicle List */}
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3 pb-24">
                {availableVehicles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No available vehicles found</p>
                    {searchTerm && <p className="text-sm">Try adjusting your search terms</p>}
                  </div>
                ) : (
                  availableVehicles.map((vehicle) => (
                    <Card
                      key={vehicle.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedVehicleId === vehicle.id
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                    >
                      <CardContent className="p-3 lg:p-4">
                        <div className="flex items-start gap-3 lg:gap-4">
                          {/* Vehicle Image */}
                          <div className="w-20 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                            {vehicle.carDetails.image ? (
                              <img
                                src={vehicle.carDetails.image}
                                alt={`${vehicle.carDetails.make} ${vehicle.carDetails.model}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Car className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>

                          {/* Vehicle Details */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="font-semibold text-base lg:text-lg truncate">
                                  {vehicle.carDetails.make} {vehicle.carDetails.model}{' '}
                                  {vehicle.carDetails.year}
                                </h4>
                                <p className="text-xs lg:text-sm text-muted-foreground truncate">
                                  {vehicle.carDetails.color} • {vehicle.carDetails.plateNumber}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {selectedVehicleId === vehicle.id ? (
                                  <CheckCircle className="w-5 h-5 text-primary" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1">
                              <Badge className={getOwnerBadgeColor(vehicle.ownerType)}>
                                <Building className="w-3 h-3 mr-1" />
                                {vehicle.ownerType === 'nacs' ? 'NACS' : 'Partner'}
                              </Badge>
                              <Badge variant="outline">{vehicle.specifications.category}</Badge>
                            </div>

                            {/* Owner Name */}
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium truncate">
                                {vehicle.ownerName}
                              </span>
                            </div>

                            {/* Specifications */}
                            <div className="grid grid-cols-3 gap-2 text-xs lg:text-sm text-muted-foreground">
                              <div className="flex items-center gap-1 truncate">
                                <Users className="w-4 h-4" />
                                <span>{vehicle.specifications.passengers}</span>
                              </div>
                              <div className="flex items-center gap-1 truncate">
                                <Luggage className="w-4 h-4" />
                                <span>{vehicle.specifications.bags}</span>
                              </div>
                              <div className="flex items-center gap-1 truncate">
                                <Gauge className="w-4 h-4" />
                                <span>{vehicle.specifications.transmission}</span>
                              </div>
                            </div>

                            {/* Pricing and Condition */}
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="text-base lg:text-lg font-semibold leading-tight">
                                  {formatCurrency(vehicle.pricing.dailyRate)}/day
                                </p>
                                <p className="text-xs lg:text-sm text-muted-foreground">
                                  {vehicle.pricing.currency}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  vehicle.status.condition === 'excellent'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : vehicle.status.condition === 'good'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }
                              >
                                {vehicle.status.condition}
                              </Badge>
                            </div>

                            {/* Features */}
                            {vehicle.specifications.features.length > 0 && (
                              <div>
                                <div className="flex flex-wrap gap-1">
                                  {vehicle.specifications.features
                                    .slice(0, 3)
                                    .map((feature, index) => (
                                      <Badge key={index} color="secondary" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                  {vehicle.specifications.features.length > 3 && (
                                    <Badge color="secondary" className="text-xs">
                                      +{vehicle.specifications.features.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Action Buttons (sticky on mobile) */}
            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background py-3 -mx-4 px-4 lg:static lg:bg-transparent lg:py-0 lg:mx-0 lg:px-0">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  setSelectedVehicleId(null);
                  setSearchTerm('');
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleAssignVehicle} disabled={!selectedVehicleId || loading}>
                {loading ? 'Assigning...' : 'Assign Vehicle'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
