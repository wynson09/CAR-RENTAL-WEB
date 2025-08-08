"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Car {
  id: number;
  name: string;
  image: string;
  price: string;
  category: string;
  passengers: string;
  bags: string;
  transmission: string;
  features: string[];
}

interface CarCardProps {
  car: Car;
  onBookNow?: (car: Car) => void;
  className?: string;
}

export const CarCard = ({ car, onBookNow, className }: CarCardProps) => {
  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow(car);
    }
  };

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden",
      className
    )}>
      {/* Car Image */}
      <div className="aspect-[4/3] relative bg-gray-100 dark:bg-gray-700">
        <Image
          src={car.image}
          alt={car.name}
          fill
          className="object-cover"
          onError={(e) => {
            // Prevent infinite loop by only setting fallback once
            if (!e.currentTarget.src.includes('placeholder')) {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3ECar Image%3C/text%3E%3C/svg%3E";
            }
          }}
        />
      </div>
      
      {/* Car Details */}
      <div className="p-4">
        {/* Car Name */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {car.name}
        </h3>
        
        {/* Price */}
        <div>
          <span className="text-base text-gray-600 dark:text-gray-400">Price: </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{car.price}</span>
        </div>
        <div className="mb-2">
          <span className="text-base text-gray-600 dark:text-gray-400">Discounted Price: </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{car.price}</span>
        </div>
        
        {/* Car Specs */}
        <div className="flex justify-center items-center gap-4 mb-4 text-base text-gray-600 dark:text-gray-400 border-y border-gray-200 dark:border-gray-700 py-4">
          <div className="flex items-center gap-1">
            <Users className="h-5 w-5 text-primary-500" />
            <span>{car.passengers}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="h-5 w-5 text-primary-500" />
            <span>{car.bags}</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings  className="h-5 w-5 text-primary-500" />
            <span>{car.transmission}</span>
          </div>
        </div>
        
        {/* Features */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-1 text-base text-gray-600 dark:text-gray-400">
            {car.features.slice(0, 8).map((feature: string, index: number) => (
              <div key={index} className="flex items-center">
                <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                {feature}
              </div>
            ))}
          </div>
        </div>
        
        {/* Book Now Button */}
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleBookNow}
        >
          BOOK NOW
        </Button>
      </div>
    </div>
  );
};