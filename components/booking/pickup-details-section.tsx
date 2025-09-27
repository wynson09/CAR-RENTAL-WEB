'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { TimePicker } from './time-picker';

interface PickupDetailsSectionProps {
  pickUpAddress: string;
  onPickUpAddressChange: (value: string) => void;
  pickupPagadianDetails: string;
  onPickupPagadianDetailsChange: (value: string) => void;
  pickupDate: Date;
  onPickupDateChange: (date: Date) => void;
  pickupTime: string;
  onPickupTimeChange: (time: string) => void;
  validationErrors: string[];
  onErrorClear: (field: string) => void;
}

const pickupAddressOptions = [
  { value: 'nacs-garage', label: 'Self Pick Up @ NACS Car Rental Garage' },
  { value: 'pagadian-airport', label: 'Pagadian Airport' },
  { value: 'pagadian-area', label: 'Pagadian Area' },
];

export const PickupDetailsSection = ({
  pickUpAddress,
  onPickUpAddressChange,
  pickupPagadianDetails,
  onPickupPagadianDetailsChange,
  pickupDate,
  onPickupDateChange,
  pickupTime,
  onPickupTimeChange,
  validationErrors,
  onErrorClear,
}: PickupDetailsSectionProps) => {
  const hasFieldError = (fieldName: string) => validationErrors.includes(fieldName);

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pickup Details</h3>
      </div>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
        <div>
          <Label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
            Pick up Address <span className="text-red-500">*</span>
          </Label>
          <Select
            value={pickUpAddress}
            onValueChange={(value) => {
              onPickUpAddressChange(value);
              // Clear Pagadian details if not selecting Pagadian area
              if (value !== 'pagadian-area') {
                onPickupPagadianDetailsChange('');
              }
              // Clear validation error when user selects
              if (hasFieldError('pickUpAddress') && value) {
                onErrorClear('pickUpAddress');
              }
            }}
          >
            <SelectTrigger
              data-field="pickUpAddress"
              className={cn(
                hasFieldError('pickUpAddress')
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-400 ring-1 ring-red-200 dark:ring-red-800'
                  : ''
              )}
            >
              <SelectValue placeholder="Select pickup location" />
            </SelectTrigger>
            <SelectContent>
              {pickupAddressOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Conditional input for Pagadian Area pickup details */}
          {pickUpAddress === 'pagadian-area' && (
            <div className="mt-3">
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Specific Location in Pagadian Area <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                data-field="pickupPagadianDetails"
                placeholder="Enter specific address or landmark"
                value={pickupPagadianDetails}
                onChange={(e) => {
                  onPickupPagadianDetailsChange(e.target.value);
                  // Clear validation error when user types
                  if (hasFieldError('pickupPagadianDetails') && e.target.value.trim()) {
                    onErrorClear('pickupPagadianDetails');
                  }
                }}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  hasFieldError('pickupPagadianDetails')
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-400 ring-1 ring-red-200 dark:ring-red-800'
                    : 'hover:border-blue-300 focus:border-blue-500'
                )}
              />
            </div>
          )}
        </div>

        <div>
          <Label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
            Pick up Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !pickupDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {pickupDate ? format(pickupDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={pickupDate}
                onSelect={(date) => onPickupDateChange(date || new Date())}
                month={pickupDate}
                onMonthChange={onPickupDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
            Pick up Time <span className="text-red-500">*</span>
          </Label>
          <div data-field="pickupTime">
            <TimePicker
              selectedTime={pickupTime}
              onTimeChange={(time) => {
                onPickupTimeChange(time);
                // Clear validation error when user selects time
                if (hasFieldError('pickupTime') && time) {
                  onErrorClear('pickupTime');
                }
              }}
              placeholder="--:-- --"
              hasError={hasFieldError('pickupTime')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
