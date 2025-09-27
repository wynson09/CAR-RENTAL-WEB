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

interface ReturnDetailsSectionProps {
  returnAddress: string;
  onReturnAddressChange: (value: string) => void;
  returnPagadianDetails: string;
  onReturnPagadianDetailsChange: (value: string) => void;
  returnDate: Date;
  onReturnDateChange: (date: Date) => void;
  returnTime: string;
  onReturnTimeChange: (time: string) => void;
  validationErrors: string[];
  onErrorClear: (field: string) => void;
}

const returnAddressOptions = [
  { value: 'nacs-garage-return', label: 'Self Return @ NACS Car Rental Garage' },
  { value: 'pagadian-airport', label: 'Pagadian Airport' },
  { value: 'pagadian-area', label: 'Pagadian Area' },
];

export const ReturnDetailsSection = ({
  returnAddress,
  onReturnAddressChange,
  returnPagadianDetails,
  onReturnPagadianDetailsChange,
  returnDate,
  onReturnDateChange,
  returnTime,
  onReturnTimeChange,
  validationErrors,
  onErrorClear,
}: ReturnDetailsSectionProps) => {
  const hasFieldError = (fieldName: string) => validationErrors.includes(fieldName);

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Return Details</h3>
      </div>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
        <div>
          <Label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
            Return Address <span className="text-red-500">*</span>
          </Label>
          <Select
            value={returnAddress}
            onValueChange={(value) => {
              onReturnAddressChange(value);
              // Clear Pagadian details if not selecting Pagadian area
              if (value !== 'pagadian-area') {
                onReturnPagadianDetailsChange('');
              }
              // Clear validation error when user selects
              if (hasFieldError('returnAddress') && value) {
                onErrorClear('returnAddress');
              }
            }}
          >
            <SelectTrigger
              data-field="returnAddress"
              className={cn(
                hasFieldError('returnAddress')
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-400 ring-1 ring-red-200 dark:ring-red-800'
                  : ''
              )}
            >
              <SelectValue placeholder="Select return location" />
            </SelectTrigger>
            <SelectContent>
              {returnAddressOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Conditional input for Pagadian Area return details */}
          {returnAddress === 'pagadian-area' && (
            <div className="mt-3">
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Specific Location in Pagadian Area <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                data-field="returnPagadianDetails"
                placeholder="Enter specific address or landmark"
                value={returnPagadianDetails}
                onChange={(e) => {
                  onReturnPagadianDetailsChange(e.target.value);
                  // Clear validation error when user types
                  if (hasFieldError('returnPagadianDetails') && e.target.value.trim()) {
                    onErrorClear('returnPagadianDetails');
                  }
                }}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  hasFieldError('returnPagadianDetails')
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-400 ring-1 ring-red-200 dark:ring-red-800'
                    : 'hover:border-blue-300 focus:border-blue-500'
                )}
              />
            </div>
          )}
        </div>

        <div>
          <Label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
            Return Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !returnDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {returnDate ? format(returnDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={(date) => {
                  if (date) {
                    onReturnDateChange(date);
                  } else {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    onReturnDateChange(tomorrow);
                  }
                }}
                month={returnDate}
                onMonthChange={onReturnDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
            Return Time <span className="text-red-500">*</span>
          </Label>
          <div data-field="returnTime">
            <TimePicker
              selectedTime={returnTime}
              onTimeChange={(time) => {
                onReturnTimeChange(time);
                // Clear validation error when user selects time
                if (hasFieldError('returnTime') && time) {
                  onErrorClear('returnTime');
                }
              }}
              placeholder="--:-- --"
              hasError={hasFieldError('returnTime')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
