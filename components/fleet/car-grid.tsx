"use client";

import { useState, useMemo } from "react";
import { CarCard, Car } from "./car-card";
import { CarFilter, CarCategory } from "./car-filter";
import { cn } from "@/lib/utils";

interface CarGridProps {
  cars: Car[];
  onBookNow?: (car: Car) => void;
  showFilter?: boolean;
  defaultCategory?: CarCategory;
  className?: string;
  gridClassName?: string;
}

export const CarGrid = ({ 
  cars, 
  onBookNow, 
  showFilter = true,
  defaultCategory = "All",
  className,
  gridClassName 
}: CarGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState<CarCategory>(defaultCategory);

  // Filter cars based on selected category
  const filteredCars = useMemo(() => {
    if (selectedCategory === "All") {
      return cars;
    }
    
    return cars.filter(car => {
      const carCategory = car.category.toLowerCase();
      const selectedCat = selectedCategory.toLowerCase();
      
      // Handle category matching
      if (selectedCat === "pickup" && carCategory === "pickup") return true;
      if (selectedCat === "van" && carCategory === "van") return true;
      if (selectedCat === "suv" && carCategory === "suv") return true;
      if (selectedCat === "sedan" && carCategory === "sedan") return true;
      if (selectedCat === "mpv" && carCategory === "mpv") return true;
      if (selectedCat === "hatchback" && carCategory === "hatchback") return true;
      
      return false;
    });
  }, [cars, selectedCategory]);

  const handleCategoryChange = (category: CarCategory) => {
    setSelectedCategory(category);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Category Filter */}
      {showFilter && (
        <CarFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {/* Cars Grid */}
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        gridClassName
      )}>
        {filteredCars.map((car) => (
          <CarCard 
            key={car.id} 
            car={car} 
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