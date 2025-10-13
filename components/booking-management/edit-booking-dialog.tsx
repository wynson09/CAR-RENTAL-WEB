'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { MapPin, Clock, User, Car, DollarSign, Save, X, CalendarIcon } from 'lucide-react';
import { TimePicker } from '@/components/booking/time-picker';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
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
    pickUpDate: new Date(),
    pickUpTime: '',
    returnDate: new Date(),
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
        pickUpDate: new Date(booking.bookingDetails.pickUpDate),
        pickUpTime: booking.bookingDetails.pickUpTime || '',
        returnDate: new Date(booking.bookingDetails.returnDate),
        returnTime: booking.bookingDetails.returnTime || '',
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
          pickUpDate: formData.pickUpDate.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
          pickUpTime: formData.pickUpTime,
          returnDate: formData.returnDate.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
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
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', // This will give us "Sep" instead of "September"
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const formattedDate = formatDate(dateStr);
    return `${formattedDate} at ${timeStr}`;
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{ width: '98vw', maxWidth: '1400px' }}
      >
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span>Edit Booking</span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Booking ID: {booking.id?.slice(-8)}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-2 h-6 bg-primary rounded-full"></div>
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <span>{formatDate(booking.createdAt)}</span>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <span>{formatDate(booking.updatedAt)}</span>
                </div>
              </div>

              <Separator />

              {/* Vehicle Information */}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Selected Vehicle
                </Label>
                <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Image
                      src={
                        booking.selectedVehicles.vehicleUrl || '/images/all-img/comming-soon.png'
                      }
                      alt={booking.selectedVehicles.name}
                      width={64}
                      height={64}
                      className="rounded-lg object-contain bg-white p-2"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%239ca3af'%3ECar%3C/text%3E%3C/svg%3E"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-purple-900">
                        {booking.selectedVehicles.name}
                      </p>
                      <p className="text-sm text-purple-700 mt-1">
                        {formatCurrency(booking.selectedVehicles.pricePerDay)}/day •{' '}
                        {booking.selectedVehicles.totalDuration} days
                      </p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          Total: {formatCurrency(booking.selectedVehicles.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {booking.payment && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Payment Details
                  </Label>
                  <div className="mt-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-blue-100 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium">Total Amount</p>
                        <p className="font-bold text-lg text-blue-700 mt-1">
                          {formatCurrency(booking.payment.totalAmount)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-100 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-600 font-medium">Paid</p>
                        <p className="font-bold text-lg text-green-700 mt-1">
                          {formatCurrency(booking.payment.paid)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-orange-100 border border-orange-200 rounded-lg">
                        <p className="text-xs text-orange-600 font-medium">Balance</p>
                        <p className="font-bold text-lg text-orange-700 mt-1">
                          {formatCurrency(booking.payment.balance)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-green-200 flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">Payment Status:</span>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${
                          booking.payment.status === 'paid'
                            ? 'border-green-500 text-green-700 bg-green-50'
                            : booking.payment.status === 'unpaid'
                            ? 'border-orange-500 text-orange-700 bg-orange-50'
                            : 'border-gray-500 text-gray-700 bg-gray-50'
                        }`}
                      >
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
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-2 h-6 bg-primary rounded-full"></div>
                Edit Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Status Update */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <Label htmlFor="status" className="text-sm font-medium text-blue-900">
                    Booking Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: BookingData['bookingDetails']['status']) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="mt-2 border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">🔄 Processing</SelectItem>
                      <SelectItem value="reserved">📅 Reserved</SelectItem>
                      <SelectItem value="ongoing">🚗 Ongoing</SelectItem>
                      <SelectItem value="completed">✅ Completed</SelectItem>
                      <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                      <SelectItem value="refunded">💰 Refunded</SelectItem>
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
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Clock className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-gray-900">Schedule</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Pick up Date <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400',
                              !formData.pickUpDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.pickUpDate ? (
                              format(formData.pickUpDate, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.pickUpDate}
                            onSelect={(date) =>
                              setFormData({ ...formData, pickUpDate: date || new Date() })
                            }
                            month={formData.pickUpDate}
                            onMonthChange={(date) => setFormData({ ...formData, pickUpDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Pick up Time <span className="text-red-500">*</span>
                      </Label>
                      <TimePicker
                        selectedTime={formData.pickUpTime}
                        onTimeChange={(time) => setFormData({ ...formData, pickUpTime: time })}
                        placeholder="--:-- --"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Return Date <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400',
                              !formData.returnDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.returnDate ? (
                              format(formData.returnDate, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.returnDate}
                            onSelect={(date) =>
                              setFormData({ ...formData, returnDate: date || new Date() })
                            }
                            month={formData.returnDate}
                            onMonthChange={(date) => setFormData({ ...formData, returnDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Return Time <span className="text-red-500">*</span>
                      </Label>
                      <TimePicker
                        selectedTime={formData.returnTime}
                        onTimeChange={(time) => setFormData({ ...formData, returnTime: time })}
                        placeholder="--:-- --"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                    className="px-6"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="px-6 bg-primary hover:bg-primary/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
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
