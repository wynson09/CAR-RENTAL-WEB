"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/card-snippet";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CarGrid, Car } from "@/components/fleet";
import { CarFirebaseService } from "@/lib/firebase-car-service";
import { CarListing } from "@/data/car-listings-data";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ErrorBoundary from "@/components/error-boundary";
// Convert CarListing data to Car data format for fleet display
const convertCarListingToCar = (carListing: CarListing): Car => {
  // Add promotional indicator to features if the car is promotional
  const features = carListing.features

  // Provide fallback for missing or invalid image URLs
  const imageUrl = carListing.image && carListing.image.trim() !== ""
    ? carListing.image
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3ECar Image%3C/text%3E%3C/svg%3E";

  return {
    id: parseInt(carListing.id) || Math.random(), // Convert string id to number
    name: carListing.isPromo ? `🔥 ${carListing.name}` : carListing.name,
    image: imageUrl,
    price: carListing.price,
    category: carListing.category,
    passengers: carListing.passengers,
    bags: carListing.bags,
    transmission: carListing.transmission,
    features: features,
  };
};

const FleetPage = () => {
  const [destination, setDestination] = useState("");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  
  // Firebase data state
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cars from Firebase on component mount
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const carListings = await CarFirebaseService.getAllCars();
        const convertedCars = carListings.map(convertCarListingToCar);
        
        setCars(convertedCars);
        toast.success(`Loaded ${convertedCars.length} vehicles from database`);
      } catch (err) {
        console.error("Error fetching cars:", err);
        setError("Failed to load vehicles. Please try again.");
        toast.error("Failed to load vehicles from database");
        setCars([]); // Set empty array as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const addressOptions = [
    { value: "nacs-garage", label: "Self Pick Up @ NACS Car Rental Garage" },
    { value: "pagadian-airport", label: "Pagadian Airport" },
    { value: "pagadian-area", label: "Pagadian Area" },
  ];

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '10', '20', '30', '40', '50'];
  const periods = ['AM', 'PM'];

  const handleBookNow = (car: Car) => {
    // Handle booking logic here
    console.log("Booking car:", car);
    // You can navigate to booking page or open a modal
  };

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const carListings = await CarFirebaseService.getAllCars();
      const convertedCars = carListings.map(convertCarListingToCar);
      
      setCars(convertedCars);
      toast.success(`Refreshed! Loaded ${convertedCars.length} vehicles`);
    } catch (err) {
      console.error("Error refreshing cars:", err);
      setError("Failed to refresh vehicles. Please try again.");
      toast.error("Failed to refresh vehicles");
    } finally {
      setLoading(false);
    }
  };

  const DrumRollTimePicker = ({ 
    selectedTime, 
    onTimeChange, 
    placeholder = "--:-- --" 
  }: { 
    selectedTime: string; 
    onTimeChange: (time: string) => void; 
    placeholder?: string;
  }) => {
    const parseTime = (timeStr: string) => {
      if (!timeStr) return { hour: '', minute: '', period: '' };
      const [time, period] = timeStr.split(' ');
      const [hour, minute] = time.split(':');
      return { hour, minute, period: period || '' };
    };
    
    const { hour: selectedHour, minute: selectedMinute, period: selectedPeriod } = parseTime(selectedTime);
    
    // Temporary states for preview before confirming
    const [tempHour, setTempHour] = useState(selectedHour || '01');
    const [tempMinute, setTempMinute] = useState(selectedMinute || '00');
    const [tempPeriod, setTempPeriod] = useState(selectedPeriod || 'AM');
    const [isOpen, setIsOpen] = useState(false);
    
    const handleConfirmTime = () => {
      if (tempHour && tempMinute && tempPeriod) {
        onTimeChange(`${tempHour}:${tempMinute} ${tempPeriod}`);
        setIsOpen(false);
      }
    };
    
    const handleCancel = () => {
      // Reset temp values to current selected values
      setTempHour(selectedHour || '01');
      setTempMinute(selectedMinute || '00');
      setTempPeriod(selectedPeriod || 'AM');
      setIsOpen(false);
    };

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedTime && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {selectedTime || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Hours Drum */}
            <div className="flex flex-col items-center border-r">
              <div className="text-xs font-medium text-center py-2 px-3 border-b w-full bg-muted">
                Hour
              </div>
              <ScrollArea className="h-48 w-16">
                <div className="p-1">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      className={cn(
                        "w-full p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground",
                        tempHour === hour && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setTempHour(hour)}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* Minutes Drum */}
            <div className="flex flex-col items-center border-r">
              <div className="text-xs font-medium text-center py-2 px-3 border-b w-full bg-muted">
                Min
              </div>
              <ScrollArea className="h-48 w-16">
                <div className="p-1">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      className={cn(
                        "w-full p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground",
                        tempMinute === minute && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setTempMinute(minute)}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* AM/PM Drum */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-medium text-center py-2 px-3 border-b w-full bg-muted">
                Period
              </div>
              <ScrollArea className="h-48 w-16">
                <div className="p-1">
                  {periods.map((period) => (
                    <button
                      key={period}
                      className={cn(
                        "w-full p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground",
                        tempPeriod === period && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setTempPeriod(period)}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 p-3 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleConfirmTime}
            >
              Set Time
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="space-y-5">
      <Card title="Car Rental Booking">
        <div className="space-y-6">
          {/* Destination */}
          <div>
            <Label htmlFor="destination" className="mb-2 block">
              Destination <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="destination"
              placeholder="Indicate your farthest destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={cn(
                "min-h-[80px] resize-none",
                destination && "border-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-400"
              )}
              rows={3}
            />
          </div>

          {/* Pickup Section */}
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
            <div>
              <Label className="mb-2 block">
                Pick up Address <span className="text-red-500">*</span>
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select pickup location" />
                </SelectTrigger>
                <SelectContent>
                  {addressOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">
                Pick up Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !pickupDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pickupDate ? format(pickupDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={pickupDate}
                    onSelect={setPickupDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="mb-2 block">
                Pick up Time <span className="text-red-500">*</span>
              </Label>
              <DrumRollTimePicker
                selectedTime={pickupTime}
                onTimeChange={setPickupTime}
                placeholder="--:-- --"
              />
            </div>
          </div>

          {/* Return Section */}
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
            <div>
              <Label className="mb-2 block">
                Return Address <span className="text-red-500">*</span>
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select return location" />
                </SelectTrigger>
                <SelectContent>
                  {addressOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">
                Return Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !returnDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="mb-2 block">
                Return Time <span className="text-red-500">*</span>
              </Label>
              <DrumRollTimePicker
                selectedTime={returnTime}
                onTimeChange={setReturnTime}
                placeholder="--:-- --"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Fleet Display Section */}
      <Card title="Available Vehicles">
        {loading ? (
          <div className="space-y-6">
            {/* Loading skeleton for filter */}
            <div className="flex gap-2 mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-20" />
              ))}
            </div>
            
            {/* Loading skeleton for car grid */}
            <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(380px,1fr))]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-center gap-4 py-4">
                      <Skeleton className="h-5 w-8" />
                      <Skeleton className="h-5 w-8" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 dark:text-red-400 mb-4">
              <p className="text-lg font-medium">⚠️ Error Loading Vehicles</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No vehicles available at the moment.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Please check back later or contact support.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Refresh Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleRefreshData} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
            
            <ErrorBoundary>
              <CarGrid 
                cars={cars}
                onBookNow={handleBookNow}
                showFilter={true}
                defaultCategory="All"
              />
            </ErrorBoundary>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FleetPage;