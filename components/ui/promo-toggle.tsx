'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface PromoToggleProps {
  label?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  description?: string;
}

export const PromoToggle = ({
  label = 'Promotional Car',
  value,
  onChange,
  className,
  description = 'Mark this car as a promotional offer',
}: PromoToggleProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}

      <div
        className={cn(
          'relative p-4 border rounded-lg transition-all duration-200',
          value
            ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/20'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                value
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              )}
            >
              <Icon icon={value ? 'heroicons:megaphone' : 'heroicons:tag'} className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {value ? 'Promotional Car' : 'Regular Car'}
                </span>
                {value && (
                  <Badge variant="outline" className="bg-blue-600 text-white border-blue-600">
                    <Icon icon="heroicons:sparkles" className="h-3 w-3 mr-1" />
                    Promo
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {value
                  ? 'This car will be highlighted with promotional badges and featured in special offers'
                  : description}
              </p>
            </div>
          </div>

          <Switch
            checked={value}
            onCheckedChange={onChange}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>

        {/* Promotional Features Preview */}
        {value && (
          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <Icon icon="heroicons:check-circle" className="h-4 w-4" />
              <span>Will appear with promotional badges</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mt-1">
              <Icon icon="heroicons:check-circle" className="h-4 w-4" />
              <span>Featured in special offers section</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
