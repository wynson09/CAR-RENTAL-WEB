'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CarCategory = 'All' | 'Sedan' | 'SUV' | 'MPV' | 'Pickup' | 'Van' | 'Hatchback';

interface CarFilterProps {
  selectedCategory: CarCategory;
  onCategoryChange: (category: CarCategory) => void;
  className?: string;
}

export const CarFilter = ({ selectedCategory, onCategoryChange, className }: CarFilterProps) => {
  const categories: CarCategory[] = ['All', 'Sedan', 'SUV', 'MPV', 'Pickup', 'Van', 'Hatchback'];

  return (
    <div className={cn('flex flex-wrap gap-2 mb-6', className)}>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category)}
          className={cn(
            'transition-all duration-200',
            selectedCategory === category
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
          )}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};
