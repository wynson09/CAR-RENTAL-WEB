'use client';

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
    <div className={cn('flex flex-wrap gap-3 mb-8', className)}>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            'px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 active:scale-95',
            'border-2 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            selectedCategory === category
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg hover:bg-blue-700 hover:border-blue-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
