'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface DestinationInputProps {
  destination: string;
  onDestinationChange: (value: string) => void;
  hasError?: boolean;
  onErrorClear?: () => void;
}

export const DestinationInput = ({
  destination,
  onDestinationChange,
  hasError = false,
  onErrorClear,
}: DestinationInputProps) => {
  return (
    <div>
      <Label
        htmlFor="destination"
        className="mb-3 block text-base font-semibold text-gray-800 dark:text-gray-200"
      >
        Destination <span className="text-red-500">*</span>
      </Label>
      <Textarea
        id="destination"
        placeholder="Indicate your farthest destination"
        value={destination}
        onChange={(e) => {
          onDestinationChange(e.target.value);
          // Clear validation error when user starts typing
          if (hasError && e.target.value.trim() && onErrorClear) {
            onErrorClear();
          }
        }}
        className={cn(
          'min-h-[100px] resize-none transition-all duration-200',
          hasError
            ? 'border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-400 ring-1 ring-red-200 dark:ring-red-800'
            : destination
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-400 ring-1 ring-blue-200 dark:ring-blue-800'
            : 'hover:border-blue-300 focus:border-blue-500'
        )}
        rows={4}
      />
    </div>
  );
};
