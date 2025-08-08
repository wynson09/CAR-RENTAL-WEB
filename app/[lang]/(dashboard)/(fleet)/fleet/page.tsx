"use client";

import { useState } from "react";
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
import { fleetData } from "@/data/fleet-data";
const FleetPage = () => {
  const [destination, setDestination] = useState("");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState("");
  const [returnTime, setReturnTime] = useState("");

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
        <CarGrid 
          cars={fleetData}
          onBookNow={handleBookNow}
          showFilter={true}
          defaultCategory="All"
        />
      </Card>
    </div>
  );
};

export default FleetPage;