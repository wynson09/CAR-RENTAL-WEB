'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { CalendarDays, MapPin, Clock, User, Car, DollarSign } from 'lucide-react';
import { BookingFirebaseService, BookingData } from '@/lib/firebase-booking-service';
import { toast } from 'sonner';

interface EditBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingData | null;
  onBookingUpdated: () => void;
}

export const EditBookingDialog: React.FC<EditBookingDialogProps> = ({
  open,
  onOpenChange,
  booking,
  onBookingUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: '' as BookingData['bookingDetails']['status'],
    destination: '',
    pickUpAddress: '',
    returnAddress: '',
    pickUpDate: '',
    pickUpTime: '',
    returnDate: '',
    returnTime: '',
    withInZDS: false,
    // Renter information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  // Initialize form data when booking changes
  useEffect(() => {
    if (booking) {
      setFormData({
        status: booking.bookingDetails.status,
        destination: booking.bookingDetails.destination,
        pickUpAddress: booking.bookingDetails.pickUpAddress,
        returnAddress: booking.bookingDetails.returnAddress,
        pickUpDate: booking.bookingDetails.pickUpDate,
        pickUpTime: booking.bookingDetails.pickUpTime,
        returnDate: booking.bookingDetails.returnDate,
        returnTime: booking.bookingDetails.returnTime,
        withInZDS: booking.bookingDetails.withInZDS,
        // Renter information
        firstName: booking.renterInformation.firstName,
        lastName: booking.renterInformation.lastName,
        email: booking.renterInformation.email,
        phone: booking.renterInformation.phone,
        address: booking.renterInformation.address,
      });
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking?.id) return;

    setLoading(true);

    try {
      // Prepare the update data with the new schema structure
      const updateData = {
        renterInformation: {
          renterId: booking.renterInformation.renterId, // Keep existing renterId
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        bookingDetails: {
          ...booking.bookingDetails,
          status: formData.status,
          destination: formData.destination,
          pickUpAddress: formData.pickUpAddress,
          returnAddress: formData.returnAddress,
          pickUpDate: formData.pickUpDate,
          pickUpTime: formData.pickUpTime,
          returnDate: formData.returnDate,
          returnTime: formData.returnTime,
          withInZDS: formData.withInZDS,
        },
      };

      await BookingFirebaseService.updateBooking(booking.id, updateData);
      onBookingUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: BookingData['bookingDetails']['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{ width: '98vw', maxWidth: '1400px' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Edit Booking - {booking.id?.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Booking ID</Label>
                  <p className="font-mono">{booking.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Status</Label>
                  <Badge
                    className={`${getStatusColor(booking.bookingDetails.status)} capitalize mt-1`}
                  >
                    {booking.bookingDetails.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {booking.renterInformation.firstName} {booking.renterInformation.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {booking.renterInformation.renterId}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Drive Option</Label>
                  <p className="capitalize">
                    {booking.bookingDetails.driveOption.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(booking.createdAt)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(booking.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Vehicle Information */}
              <div>
                <Label className="text-muted-foreground">Selected Vehicle</Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{booking.selectedVehicles.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(booking.selectedVehicles.pricePerDay)}/day •{' '}
                        {booking.selectedVehicles.totalDuration} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {booking.payment && (
                <div>
                  <Label className="text-muted-foreground">Payment Details</Label>
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Amount:</span>
                      <span className="font-medium">
                        {formatCurrency(booking.payment.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Paid:</span>
                      <span className="font-medium">{formatCurrency(booking.payment.paid)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Balance:</span>
                      <span className="font-medium">{formatCurrency(booking.payment.balance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant="outline" className="text-xs">
                        {booking.payment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Vehicle */}
              {booking.assignedVehicle && (
                <div>
                  <Label className="text-muted-foreground">Assigned Vehicle</Label>
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{booking.assignedVehicle.name}</p>
                        <p className="text-sm text-green-600">
                          {booking.assignedVehicle.plateNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Edit Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Status Update */}
                <div>
                  <Label htmlFor="status">Booking Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: BookingData['bookingDetails']['status']) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Renter Information */}
                <div className="space-y-4">
                  <h3 className="font-medium">Renter Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="renterAddress">Renter Address</Label>
                    <Textarea
                      id="renterAddress"
                      placeholder="Enter renter address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                {/* Destination and ZDS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="withInZDS" className="font-medium">
                        Within Zamboanga Del Sur
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.withInZDS
                          ? '₱200 discount will be applied to the base price'
                          : 'No ZDS discount applied'}
                      </p>
                    </div>
                    <Switch
                      id="withInZDS"
                      checked={formData.withInZDS}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, withInZDS: checked })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="destination"
                        placeholder="Enter destination"
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="pickUpAddress">Pick-up Address</Label>
                    <Textarea
                      id="pickUpAddress"
                      placeholder="Enter pick-up address"
                      value={formData.pickUpAddress}
                      onChange={(e) => setFormData({ ...formData, pickUpAddress: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="returnAddress">Return Address</Label>
                    <Textarea
                      id="returnAddress"
                      placeholder="Enter return address"
                      value={formData.returnAddress}
                      onChange={(e) => setFormData({ ...formData, returnAddress: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickUpDate">Pick-up Date</Label>
                    <Input
                      id="pickUpDate"
                      type="date"
                      value={formData.pickUpDate}
                      onChange={(e) => setFormData({ ...formData, pickUpDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickUpTime">Pick-up Time</Label>
                    <Input
                      id="pickUpTime"
                      type="time"
                      value={formData.pickUpTime}
                      onChange={(e) => setFormData({ ...formData, pickUpTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="returnDate">Return Date</Label>
                    <Input
                      id="returnDate"
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="returnTime">Return Time</Label>
                    <Input
                      id="returnTime"
                      type="time"
                      value={formData.returnTime}
                      onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Booking'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
