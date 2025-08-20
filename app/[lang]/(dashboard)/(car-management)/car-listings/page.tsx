"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { carCategories } from "@/data/car-listings-data";
import { CarFirebaseService } from "@/lib/firebase-car-service";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  LoadingSkeleton,
  EmptyState,
  CarTableView,
  CarGridView,
  AddCarDialog,
  type ViewMode,
  type LoadingStates,
  type CarListing
} from "@/components/car-management";

const CarListingsPage = () => {
  // Core state
  const [cars, setCars] = useState<CarListing[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState<LoadingStates>({
    fetchingCars: true,
    addingCar: false,
    updatingCar: null,
    deletingCars: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Real-time Firebase listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupRealtimeListener = () => {
      try {
        const q = query(
          collection(db, "car-listings"), 
          orderBy("createdDate", "desc")
        );
        
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const updatedCars: CarListing[] = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdDate: doc.data().createdDate?.toDate() || new Date(),
              updatedDate: doc.data().updatedDate?.toDate() || new Date(),
            } as CarListing));
            
            setCars(updatedCars);
            setLoading(prev => ({ ...prev, fetchingCars: false }));
            setError(null);
          },
          (error) => {
            console.error("Real-time listener error:", error);
            setError("Failed to sync car data. Please refresh the page.");
            setLoading(prev => ({ ...prev, fetchingCars: false }));
            toast.error("Connection lost. Please refresh the page.");
          }
        );
      } catch (error) {
        console.error("Setup listener error:", error);
        setError("Failed to connect to database");
        setLoading(prev => ({ ...prev, fetchingCars: false }));
      }
    };

    setupRealtimeListener();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Filter cars based on search and category
  const filteredCars = cars.filter((car) => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || car.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Helper functions for loading state management
  const updateLoading = useCallback((updates: Partial<LoadingStates>) => {
    setLoading(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSelectCar = useCallback((carId: string) => {
    setSelectedCars(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedCars.length === filteredCars.length) {
      setSelectedCars([]);
    } else {
      setSelectedCars(filteredCars.map(car => car.id));
    }
  }, [selectedCars.length, filteredCars]);

  const handleDeleteCar = useCallback(async (carId: string) => {
    try {
      updateLoading({ deletingCars: [carId] });
      
      await CarFirebaseService.deleteCar(carId);
      
      setSelectedCars(prev => prev.filter(id => id !== carId));
      toast.success("Car deleted successfully");
    } catch (error) {
      console.error("Delete car error:", error);
      toast.error("Failed to delete car. Please try again.");
    } finally {
      updateLoading({ deletingCars: [] });
    }
  }, [updateLoading]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedCars.length === 0) return;

    try {
      updateLoading({ deletingCars: selectedCars });
      
      await CarFirebaseService.deleteCars(selectedCars);
      
      setSelectedCars([]);
      toast.success(`${selectedCars.length} car(s) deleted successfully`);
    } catch (error) {
      console.error("Delete selected cars error:", error);
      toast.error("Failed to delete cars. Please try again.");
    } finally {
      updateLoading({ deletingCars: [] });
    }
  }, [selectedCars, updateLoading]);

  const handleAddCar = useCallback(async (newCar: Omit<CarListing, 'id'>) => {
    try {
      updateLoading({ addingCar: true });
      
      const carId = await CarFirebaseService.addCar(newCar);
      
      setIsAddDialogOpen(false);
      toast.success("Car added successfully");
      
      // Clear selections since we have a new car
      setSelectedCars([]);
    } catch (error) {
      console.error("Add car error:", error);
      toast.error("Failed to add car. Please try again.");
    } finally {
      updateLoading({ addingCar: false });
    }
  }, [updateLoading]);

  const handleUpdateCar = useCallback(async (updatedCar: CarListing) => {
    try {
      updateLoading({ updatingCar: updatedCar.id });
      
      const { id, createdDate, ...updateData } = updatedCar;
      await CarFirebaseService.updateCar(id, updateData);
      
      toast.success("Car updated successfully");
    } catch (error) {
      console.error("Update car error:", error);
      toast.error("Failed to update car. Please try again.");
    } finally {
      updateLoading({ updatingCar: null });
    }
  }, [updateLoading]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Car Listings</CardTitle>
              <p className="text-muted-foreground">
                Manage your car inventory with full CRUD operations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AddCarDialog 
                isOpen={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onAddCar={handleAddCar}
                isLoading={loading.addingCar}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5" />
              <div>
                <p className="font-medium">Connection Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="ml-auto"
              >
                <Icon icon="heroicons:arrow-path" className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Icon 
                  icon="heroicons:magnifying-glass" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
                />
                <Input
                  placeholder="Search cars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={loading.fetchingCars}
                />
              </div>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
                disabled={loading.fetchingCars}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {carCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle and Actions */}
            <div className="flex items-center gap-2">
              {selectedCars.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={loading.deletingCars.length > 0}
                    >
                      {loading.deletingCars.length > 0 ? (
                        <Icon icon="heroicons:arrow-path" className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Icon icon="heroicons:trash" className="h-4 w-4 mr-2" />
                      )}
                      Delete ({selectedCars.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Cars</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedCars.length} selected car(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={loading.deletingCars.length > 0}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteSelected} 
                        className="bg-destructive hover:bg-destructive/80"
                        disabled={loading.deletingCars.length > 0}
                      >
                        {loading.deletingCars.length > 0 ? (
                          <>
                            <Icon icon="heroicons:arrow-path" className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "table" ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-r-none"
                  disabled={loading.fetchingCars}
                >
                  <Icon icon="heroicons:list-bullet" className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                  disabled={loading.fetchingCars}
                >
                  <Icon icon="heroicons:squares-2x2" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Section */}
      <Card>
        <CardContent className="p-0">
          {loading.fetchingCars ? (
            <LoadingSkeleton viewMode={viewMode} />
          ) : filteredCars.length === 0 ? (
            <EmptyState 
              searchTerm={searchTerm} 
              selectedCategory={selectedCategory}
              onClearFilters={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              onAddCar={() => setIsAddDialogOpen(true)}
            />
          ) : viewMode === "table" ? (
            <CarTableView 
              cars={filteredCars}
              selectedCars={selectedCars}
              onSelectCar={handleSelectCar}
              onSelectAll={handleSelectAll}
              onDeleteCar={handleDeleteCar}
              onUpdateCar={handleUpdateCar}
              loading={loading}
            />
          ) : (
            <CarGridView 
              cars={filteredCars}
              selectedCars={selectedCars}
              onSelectCar={handleSelectCar}
              onDeleteCar={handleDeleteCar}
              onUpdateCar={handleUpdateCar}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCars.length} of {cars.length} cars
        {selectedCars.length > 0 && ` • ${selectedCars.length} selected`}
      </div>
    </div>
  );
};

export default CarListingsPage;