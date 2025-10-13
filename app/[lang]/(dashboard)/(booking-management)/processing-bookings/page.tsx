'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Edit, Car, Clock } from 'lucide-react';
import Image from 'next/image';
import { BookingFirebaseService, BookingData } from '@/lib/firebase-booking-service';
import { FleetFirebaseService, FleetVehicle } from '@/lib/firebase-fleet-service';
import { useUserStore } from '@/store';
import { toast } from 'sonner';
import { EditBookingDialog } from '@/components/booking-management/edit-booking-dialog';
import { VehicleAssignmentDialog } from '@/components/booking-management/vehicle-assignment-dialog';

const ProcessingBookingsPage = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [vehicleAssignmentDialogOpen, setVehicleAssignmentDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

  const { user } = useUserStore();

  // Load bookings and fleet vehicles
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }

    setLoading(true);

    // Set up real-time listener for processing bookings only
    const unsubscribeBookings = BookingFirebaseService.setupAllBookingsListener(
      (bookingsData) => {
        // Filter only processing bookings
        const processingBookings = bookingsData.filter(
          (booking) => booking.bookingDetails.status === 'processing'
        );
        setBookings(processingBookings);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading bookings:', error);
        toast.error('Failed to load bookings');
        setLoading(false);
      }
    );

    // Load fleet vehicles
    FleetFirebaseService.getAllVehicles()
      .then((vehicles) => {
        setFleetVehicles(vehicles);
      })
      .catch((error) => {
        console.error('Error loading fleet vehicles:', error);
        toast.error('Failed to load fleet vehicles');
      });

    return () => {
      unsubscribeBookings();
    };
  }, [user]);

  // Filter bookings based on search
  useEffect(() => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.selectedVehicles.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.bookingDetails.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.renterInformation.renterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.renterInformation.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.renterInformation.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm]);

  const handleEditBooking = (booking: BookingData) => {
    setSelectedBooking(booking);
    setEditDialogOpen(true);
  };

  const handleAssignVehicle = (booking: BookingData) => {
    setSelectedBooking(booking);
    setVehicleAssignmentDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You need admin privileges to access booking management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Processing Bookings</h1>
          <p className="text-muted-foreground">
            Manage all customer bookings that are currently in processing status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="warning" className="px-3 py-1">
            <Clock className="w-4 h-4 mr-2" />
            Processing: {bookings.length}
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Search through processing bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by vehicle, destination, renter ID, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Processing Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Bookings</CardTitle>
          <CardDescription>{filteredBookings.length} processing booking(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading processing bookings...</p>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No processing bookings found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'No processing bookings match your search.'
                  : 'All bookings have been processed or no bookings exist yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Assigned Vehicle</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={
                              booking.selectedVehicles.vehicleUrl ||
                              '/images/all-img/comming-soon.png'
                            }
                            alt={booking.selectedVehicles.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-contain bg-gray-100"
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%239ca3af'%3ECar%3C/text%3E%3C/svg%3E"
                          />
                          <div>
                            <p className="font-medium">{booking.selectedVehicles.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.bookingDetails.driveOption === 'with-driver'
                                ? 'With Driver'
                                : 'Self Drive'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {booking.renterInformation.firstName}{' '}
                            {booking.renterInformation.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {booking.renterInformation.renterId.slice(-8)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span>{booking.bookingDetails.destination}</span>
                          {booking.bookingDetails.withInZDS && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                Within ZDS
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(booking.bookingDetails.pickUpDate)}</p>
                          <p className="text-muted-foreground">
                            to {formatDate(booking.bookingDetails.returnDate)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(booking.selectedVehicles.totalAmount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.selectedVehicles.totalDuration} day(s)
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.assignedVehicle ? (
                          <div className="text-sm">
                            <p className="font-medium">{booking.assignedVehicle.name}</p>
                            <p className="text-muted-foreground">
                              {booking.assignedVehicle.plateNumber}
                            </p>
                          </div>
                        ) : (
                          <Badge color="warning" className="text-xs">
                            Needs Assignment
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBooking(booking)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignVehicle(booking)}
                            className={
                              !booking.assignedVehicle
                                ? 'border-orange-500 text-orange-600 hover:bg-orange-50'
                                : ''
                            }
                          >
                            <Car className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Booking Dialog */}
      <EditBookingDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        booking={selectedBooking}
        onBookingUpdated={() => {
          toast.success('Booking updated successfully');
        }}
      />

      {/* Vehicle Assignment Dialog */}
      <VehicleAssignmentDialog
        open={vehicleAssignmentDialogOpen}
        onOpenChange={setVehicleAssignmentDialogOpen}
        booking={selectedBooking}
        fleetVehicles={fleetVehicles}
        onVehicleAssigned={() => {
          toast.success('Vehicle assigned successfully');
        }}
      />
    </div>
  );
};

export default ProcessingBookingsPage;
