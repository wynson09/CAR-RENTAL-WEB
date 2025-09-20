'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FleetFirebaseService } from '@/lib/firebase-fleet-service';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  LoadingSkeleton,
  EmptyState,
  FleetTableView,
  FleetGridView,
  AddVehicleDialog,
  type ViewMode,
  type LoadingStates,
  type FleetVehicle,
} from '@/components/fleet-management';

const OwnedPartnerCarsPage = () => {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<FleetVehicle[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerTypeFilter, setOwnerTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState<LoadingStates>({
    fetchingVehicles: true,
    addingVehicle: false,
    updatingVehicle: null,
    deletingVehicles: [],
  });

  // Set up real-time listener
  useEffect(() => {
    const q = query(collection(db, 'fleet-inventory'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const vehicleData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          partnershipInfo: doc.data().partnershipInfo
            ? {
                ...doc.data().partnershipInfo,
                contractStartDate:
                  doc.data().partnershipInfo.contractStartDate?.toDate() || new Date(),
                contractEndDate: doc.data().partnershipInfo.contractEndDate?.toDate() || undefined,
              }
            : undefined,
        })) as FleetVehicle[];

        setVehicles(vehicleData);
        setLoading((prev) => ({ ...prev, fetchingVehicles: false }));
      },
      (error) => {
        console.error('Error in vehicles listener:', error);
        toast.error('Failed to sync vehicles');
        setLoading((prev) => ({ ...prev, fetchingVehicles: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter vehicles based on search and filters
  useEffect(() => {
    let filtered = vehicles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.carDetails.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.carDetails.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.carDetails.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Owner type filter
    if (ownerTypeFilter !== 'all') {
      filtered = filtered.filter((vehicle) => vehicle.ownerType === ownerTypeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((vehicle) => vehicle.status.availability === statusFilter);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, ownerTypeFilter, statusFilter]);

  // Handle vehicle selection
  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(vehicleId) ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId]
    );
  };

  const handleSelectAll = () => {
    setSelectedVehicles(
      selectedVehicles.length === filteredVehicles.length
        ? []
        : filteredVehicles.map((vehicle) => vehicle.id)
    );
  };

  // Handle vehicle operations
  const handleAddVehicle = async (vehicleData: Omit<FleetVehicle, 'id'>) => {
    try {
      setLoading((prev) => ({ ...prev, addingVehicle: true }));
      await FleetFirebaseService.addVehicle(vehicleData);
      toast.success('Vehicle added successfully');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle');
    } finally {
      setLoading((prev) => ({ ...prev, addingVehicle: false }));
    }
  };

  const handleUpdateVehicle = async (vehicle: FleetVehicle) => {
    try {
      setLoading((prev) => ({ ...prev, updatingVehicle: vehicle.id }));
      await FleetFirebaseService.updateVehicle(vehicle.id, vehicle);
      toast.success('Vehicle updated successfully');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
    } finally {
      setLoading((prev) => ({ ...prev, updatingVehicle: null }));
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      setLoading((prev) => ({
        ...prev,
        deletingVehicles: [...prev.deletingVehicles, vehicleId],
      }));
      await FleetFirebaseService.deleteVehicle(vehicleId);
      setSelectedVehicles((prev) => prev.filter((id) => id !== vehicleId));
      toast.success('Vehicle deleted successfully');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    } finally {
      setLoading((prev) => ({
        ...prev,
        deletingVehicles: prev.deletingVehicles.filter((id) => id !== vehicleId),
      }));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      setLoading((prev) => ({
        ...prev,
        deletingVehicles: [...prev.deletingVehicles, ...selectedVehicles],
      }));
      await FleetFirebaseService.deleteVehicles(selectedVehicles);
      setSelectedVehicles([]);
      toast.success(`${selectedVehicles.length} vehicles deleted successfully`);
    } catch (error) {
      console.error('Error deleting vehicles:', error);
      toast.error('Failed to delete vehicles');
    } finally {
      setLoading((prev) => ({
        ...prev,
        deletingVehicles: prev.deletingVehicles.filter((id) => !selectedVehicles.includes(id)),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Fleet Inventory</CardTitle>
              <p className="text-muted-foreground">
                Manage your fleet of owned and partner vehicles with full CRUD operations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AddVehicleDialog onAddVehicle={handleAddVehicle} isLoading={loading.addingVehicle} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Icon
                  icon="heroicons:magnifying-glass"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
                />
                <Input
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={ownerTypeFilter} onValueChange={setOwnerTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Owner Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  <SelectItem value="nacs">NACS</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {selectedVehicles.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Icon icon="heroicons:trash" className="h-4 w-4 mr-2" />
                      Delete ({selectedVehicles.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Vehicles</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedVehicles.length} selected
                        vehicle(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteSelected}
                        className="bg-destructive hover:bg-destructive/80"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'table' ? 'outline' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'rounded-r-none',
                    viewMode === 'table' && 'bg-primary text-primary-foreground'
                  )}
                >
                  <Icon icon="heroicons:list-bullet" className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'outline' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'rounded-l-none',
                    viewMode === 'grid' && 'bg-primary text-primary-foreground'
                  )}
                >
                  <Icon icon="heroicons:squares-2x2" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Section */}
      {loading.fetchingVehicles ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : filteredVehicles.length === 0 ? (
        vehicles.length === 0 ? (
          <EmptyState onAddVehicle={() => {}} />
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                  <Icon
                    icon="heroicons:magnifying-glass"
                    className="h-12 w-12 text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No vehicles found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters to find vehicles.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="p-0">
            {viewMode === 'table' ? (
              <FleetTableView
                vehicles={filteredVehicles}
                selectedVehicles={selectedVehicles}
                onSelectVehicle={handleSelectVehicle}
                onSelectAll={handleSelectAll}
                onDeleteVehicle={handleDeleteVehicle}
                onUpdateVehicle={handleUpdateVehicle}
                loading={loading}
              />
            ) : (
              <FleetGridView
                vehicles={filteredVehicles}
                selectedVehicles={selectedVehicles}
                onSelectVehicle={handleSelectVehicle}
                onDeleteVehicle={handleDeleteVehicle}
                onUpdateVehicle={handleUpdateVehicle}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredVehicles.length} of {vehicles.length} vehicles
            </span>
            <span>{selectedVehicles.length > 0 && `${selectedVehicles.length} selected`}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnedPartnerCarsPage;
