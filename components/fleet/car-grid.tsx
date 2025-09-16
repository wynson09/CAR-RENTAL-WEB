'use client';

import { useState, useMemo } from 'react';
import { CarCard, Car } from './car-card';
import { CarFilter, CarCategory } from './car-filter';
import { cn } from '@/lib/utils';

interface CarGridProps {
  cars: Car[];
  onBookNow?: (car: Car) => void;
  showFilter?: boolean;
  defaultCategory?: CarCategory;
  className?: string;
  gridClassName?: string;
  pickupDate?: Date;
  returnDate?: Date;
  driveOption?: 'self-drive' | 'with-driver';
}

export const CarGrid = ({
  cars,
  onBookNow,
  showFilter = true,
  pickupDate,
  returnDate,
  driveOption = 'self-drive',
  defaultCategory = 'All',
  className,
  gridClassName,
}: CarGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState<CarCategory>(defaultCategory);

  // Filter cars based on selected category
  const filteredCars = useMemo(() => {
    if (selectedCategory === 'All') {
      return cars;
    }

    return cars.filter((car) => {
      const carCategory = car.category.toLowerCase();
      const selectedCat = selectedCategory.toLowerCase();

      // Handle category matching
      if (selectedCat === 'pickup' && carCategory === 'pickup') return true;
      if (selectedCat === 'van' && carCategory === 'van') return true;
      if (selectedCat === 'suv' && carCategory === 'suv') return true;
      if (selectedCat === 'sedan' && carCategory === 'sedan') return true;
      if (selectedCat === 'mpv' && carCategory === 'mpv') return true;
      if (selectedCat === 'hatchback' && carCategory === 'hatchback') return true;

      return false;
    });
  }, [cars, selectedCategory]);

  // Priority-first sorting at render for safety
  const sortedCars = useMemo(() => {
    const list = [...filteredCars].map((c: any) => ({
      ...c,
      priorityLevel:
        typeof c.priorityLevel === 'number'
          ? c.priorityLevel
          : parseInt(String(c.priorityLevel), 10) || 0,
    }));
    list.sort((a: any, b: any) => (b.priorityLevel || 0) - (a.priorityLevel || 0));
    return list;
  }, [filteredCars]);

  const handleCategoryChange = (category: CarCategory) => {
    setSelectedCategory(category);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Category Filter */}
      {showFilter && (
        <CarFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
      )}

      {/* Cars Grid */}
      <div
        className={cn(
          'flex flex-col gap-4 sm:grid sm:gap-6 sm:grid-cols-[repeat(auto-fill,minmax(380px,1fr))]',
          gridClassName
        )}
      >
        {sortedCars.map((car) => (
          <CarCard
            key={(car as any).docId ?? car.id}
            car={car}
            pickupDate={pickupDate}
            returnDate={returnDate}
            driveOption={driveOption}
            onBookNow={onBookNow}
          />
        ))}
      </div>

      {/* No results message */}
      {filteredCars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No vehicles found for "{selectedCategory}" category.
          </p>
        </div>
      )}
    </div>
  );
};
