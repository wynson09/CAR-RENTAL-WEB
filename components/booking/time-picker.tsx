'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
}

export const TimePicker = ({
  selectedTime,
  onTimeChange,
  placeholder = '--:-- --',
  className = '',
  hasError = false,
}: TimePickerProps) => {
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '10', '20', '30', '40', '50'];
  const periods = ['AM', 'PM'];

  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: '', minute: '', period: '' };
    const [time, period] = timeStr.split(' ');
    const [hour, minute] = time.split(':');
    return { hour, minute, period: period || '' };
  };

  const {
    hour: selectedHour,
    minute: selectedMinute,
    period: selectedPeriod,
  } = parseTime(selectedTime);

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
            'w-full justify-start text-left font-normal',
            !selectedTime && 'text-muted-foreground',
            hasError &&
              'border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-400 ring-1 ring-red-200 dark:ring-red-800',
            className
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
                      'w-full p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground',
                      tempHour === hour && 'bg-primary text-primary-foreground'
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
                      'w-full p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground',
                      tempMinute === minute && 'bg-primary text-primary-foreground'
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
                      'w-full p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground',
                      tempPeriod === period && 'bg-primary text-primary-foreground'
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
          <Button variant="outline" size="sm" className="flex-1" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" className="flex-1" onClick={handleConfirmTime}>
            Set Time
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
