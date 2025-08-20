'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface ArrayInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxItems?: number;
  required?: boolean;
  type?: 'text' | 'color';
}

export const ArrayInput = ({
  label,
  value,
  onChange,
  placeholder = 'Add item...',
  className,
  maxItems,
  required = false,
  type = 'text',
}: ArrayInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isValidHexColor = (hex: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  };

  const handleAdd = () => {
    const trimmedValue = inputValue.trim();

    // Reset error
    setError(null);

    if (!trimmedValue) {
      setError('Please enter a value');
      return;
    }

    // Validate hex color if type is color
    if (type === 'color') {
      if (!isValidHexColor(trimmedValue)) {
        setError('Please enter a valid hex color (e.g., #FF0000 or #F00)');
        return;
      }
    }

    // Check for duplicates
    if (value.includes(trimmedValue)) {
      setError('This item already exists');
      return;
    }

    // Check max items
    if (maxItems && value.length >= maxItems) {
      setError(`Maximum ${maxItems} items allowed`);
      return;
    }

    onChange([...value, trimmedValue]);
    setInputValue('');
    setError(null);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (error) setError(null); // Clear error on input change
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Input Section */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className={cn(
              'flex-1',
              type === 'color' && 'pr-12',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            disabled={maxItems ? value.length >= maxItems : false}
          />
          {type === 'color' && (
            <div className="absolute right-1 top-1 bottom-1 w-10 rounded border overflow-hidden">
              <input
                type="color"
                value={isValidHexColor(inputValue) ? inputValue : '#000000'}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full h-full border-none cursor-pointer"
                disabled={maxItems ? value.length >= maxItems : false}
              />
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={handleAdd}
          size="sm"
          disabled={!inputValue.trim() || (maxItems ? value.length >= maxItems : false)}
        >
          <Icon icon="heroicons:plus" className="h-4 w-4" />
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <Icon icon="heroicons:exclamation-circle" className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Items Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/20">
          {value.map((item, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-2 px-3 py-1">
              {type === 'color' && isValidHexColor(item) && (
                <div
                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: item }}
                  title={item}
                />
              )}
              <span className="text-sm">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <Icon icon="heroicons:x-mark" className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {value.length === 0
            ? 'No items added'
            : `${value.length} item${value.length !== 1 ? 's' : ''} added`}
        </span>
        {maxItems && (
          <span>
            {value.length}/{maxItems} max
          </span>
        )}
      </div>
    </div>
  );
};
