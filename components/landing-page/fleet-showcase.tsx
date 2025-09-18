'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FaUsers, FaSuitcase, FaCog, FaCar, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Car } from '@/components/fleet/car-card';
import { CarFirebaseService } from '@/lib/firebase-car-service';
import { CarListing } from '@/data/car-listings-data';
import { Timestamp } from 'firebase/firestore';

// Car category filter
type FleetCategory = 'All' | 'SUV' | 'Sedan' | 'Hatchback' | 'Van' | 'Pickup' | 'MPV';

const categoryFilters: FleetCategory[] = [
  'All',
  'SUV',
  'Sedan',
  'MPV',
  'Van',
  'Pickup',
  'Hatchback',
];

// Session cache key
const CARS_SESSION_CACHE_KEY = 'landing:fleet:cars';

// Convert CarListing data to Car data format for fleet display (same as booking page)
const convertCarListingToCar = (carListing: CarListing): Car => {
  // Provide fallback for missing or invalid image URLs
  const imageUrl =
    carListing.image && carListing.image.trim() !== ''
      ? carListing.image
      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3ECar Image%3C/text%3E%3C/svg%3E";

  return {
    id: parseInt(carListing.id) || Math.random(),
    name: carListing.isPromo ? `🔥 ${carListing.name}` : carListing.name,
    image: imageUrl,
    price: carListing.price,
    isPromo: carListing.isPromo,
    // Ensure priority is present and numeric for sorting
    ...({
      priorityLevel:
        typeof (carListing as any).priorityLevel === 'number'
          ? (carListing as any).priorityLevel
          : parseInt(String((carListing as any).priorityLevel), 10) || 0,
    } as any),
    category: carListing.category,
    passengers: carListing.passengers,
    bags: carListing.bags,
    transmission: carListing.transmission,
    features: carListing.features,
    // Keep a stable reference to the Firestore document id for merging updates
    ...({ docId: carListing.id, updatedDate: carListing.updatedDate } as any),
  };
};

// Ensure a list has unique cars by stable key
const uniqueByDocId = (items: Car[]): Car[] => {
  const seen = new Set<string>();
  const out: Car[] = [];
  items.forEach((c: any) => {
    const key = String(c.docId ?? c.id ?? c.name);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
  });
  return out;
};

// Normalize a name by stripping promo emoji/whitespace and lowercasing
const normalizeName = (name: string) => name.replace(/🔥/g, '').trim().toLowerCase();

// Keep only one car per vehicle name; prefer promo, else latest updated
const uniqueByVehicleName = (items: Car[]): Car[] => {
  const map = new Map<string, any>();
  items.forEach((c: any) => {
    const key = normalizeName(c.name || '');
    const existing = map.get(key);
    if (!existing) {
      map.set(key, c);
      return;
    }
    const existingIsPromo = !!existing.isPromo;
    const currentIsPromo = !!c.isPromo;
    if (currentIsPromo && !existingIsPromo) {
      map.set(key, c);
      return;
    }
    const existingUpdated = existing.updatedDate?.getTime?.() || 0;
    const currentUpdated = c.updatedDate?.getTime?.() || 0;
    if (currentUpdated > existingUpdated) {
      map.set(key, c);
    }
  });
  return Array.from(map.values());
};

// Simplified car card without pricing
const FleetCarCard = ({ car }: { car: Car }) => {
  const PLACEHOLDER_IMAGE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3ECar Image%3C/text%3E%3C/svg%3E";

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (!target.src.includes('placeholder')) {
      target.src = PLACEHOLDER_IMAGE;
    }
  };

  const getCleanCarName = (name: string): string => {
    return name.replace(/🔥\s*/, '');
  };

  const hasPromoBadge = (name: string): boolean => {
    return name.includes('🔥');
  };

  return (
    <motion.div
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary/30"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      {/* Car Image */}
      <div className="relative h-48 lg:h-56 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
        {/* Promotional badge */}
        {(hasPromoBadge(car.name) || car.isPromo) && (
          <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white">
            ✨ FEATURED
          </div>
        )}

        <Image
          src={car.image}
          alt={getCleanCarName(car.name)}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={handleImageError}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Car Details */}
      <div className="p-6">
        {/* Car Name & Category */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
              {getCleanCarName(car.name)}
            </h3>
            <Badge
              color="secondary"
              className="ml-2 text-xs font-medium bg-primary/10 text-primary border-primary/20"
            >
              {car.category}
            </Badge>
          </div>
        </div>

        {/* Car Specifications */}
        <div className="grid grid-cols-3 gap-4 mb-5 py-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg">
              <FaUsers className="w-4 h-4" />
            </div>
            <p className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">
              {car.passengers}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Seater</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg">
              <FaSuitcase className="w-4 h-4" />
            </div>
            <p className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">
              {car.bags}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Luggage</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg">
              <FaCog className="w-4 h-4" />
            </div>
            <p className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">
              {car.transmission}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Trans</p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <FaCheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Key Features
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {car.features.map((feature, index) => (
              <div
                key={`${car.id}-feature-${index}`}
                className="flex items-center text-xs lg:text-sm text-gray-600 dark:text-gray-400"
              >
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                <span className="truncate">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold py-2.5 rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/25">
          <FaCar className="w-4 h-4 mr-2" />
          Book Now
          <FaArrowRight className="w-3 h-3 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
};

const FleetShowcase = () => {
  const [selectedCategory, setSelectedCategory] = useState<FleetCategory>('All');

  // Firebase data state
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helpers for session cache
  const readCache = useCallback((): { cars: Car[]; lastUpdatedMs: number } | null => {
    try {
      const raw = sessionStorage.getItem(CARS_SESSION_CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const writeCache = useCallback((carsToStore: Car[]) => {
    try {
      const latest = carsToStore
        .map((c: any) => c.updatedDate?.getTime?.() || 0)
        .reduce((a, b) => Math.max(a, b), 0);
      sessionStorage.setItem(
        CARS_SESSION_CACHE_KEY,
        JSON.stringify({ cars: carsToStore, lastUpdatedMs: latest })
      );
    } catch {}
  }, []);

  const cacheKey = useMemo(() => 'fleet_showcase_cars', []);

  // Fetch cars from Firebase (same logic as booking page)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const cached = readCache();
        if (cached && cached.cars.length > 0) {
          const normalized = uniqueByVehicleName(uniqueByDocId(cached.cars));
          normalized.sort((a: any, b: any) => (b.priorityLevel || 0) - (a.priorityLevel || 0));
          setCars(normalized);
          setLoading(false);

          const lastTs = cached.lastUpdatedMs ? Timestamp.fromMillis(cached.lastUpdatedMs) : null;
          unsubscribe = CarFirebaseService.listenToCarsSince(
            lastTs,
            (changedCars) => {
              if (!changedCars || changedCars.length === 0) return;
              setCars((prev) => {
                const map = new Map<string, any>();
                prev.forEach((c: any) => map.set(String(c.docId ?? c.id), c));
                changedCars.forEach((listing) => {
                  const converted = convertCarListingToCar(listing as any);
                  map.set(String((listing as any).id), converted);
                });
                const merged = uniqueByVehicleName(
                  uniqueByDocId(Array.from(map.values()) as Car[])
                );
                merged.sort((a: any, b: any) => (b.priorityLevel || 0) - (a.priorityLevel || 0));
                writeCache(merged);
                return merged;
              });
            },
            (error) => {
              console.error('Fleet cars listener error:', error);
            }
          );
          return;
        }

        // No cache → fetch once and then attach listener
        const carListings = await CarFirebaseService.getAllCars();
        const convertedCars = uniqueByVehicleName(
          uniqueByDocId(carListings.map(convertCarListingToCar))
        );
        convertedCars.sort((a: any, b: any) => (b.priorityLevel || 0) - (a.priorityLevel || 0));
        setCars(convertedCars);
        writeCache(convertedCars);

        const lastTs = carListings[0]?.updatedDate ? (carListings[0].updatedDate as any) : null;
        unsubscribe = CarFirebaseService.listenToCarsSince(
          lastTs,
          (changedCars) => {
            if (!changedCars || changedCars.length === 0) return;
            setCars((prev) => {
              const map = new Map<string, any>();
              prev.forEach((c: any) => map.set(String(c.docId ?? c.id), c));
              changedCars.forEach((listing) => {
                const converted = convertCarListingToCar(listing as any);
                map.set(String((listing as any).id), converted);
              });
              const merged = uniqueByVehicleName(uniqueByDocId(Array.from(map.values()) as Car[]));
              merged.sort((a: any, b: any) => (b.priorityLevel || 0) - (a.priorityLevel || 0));
              writeCache(merged);
              return merged;
            });
          },
          (error) => {
            console.error('Fleet cars listener error:', error);
          }
        );
      } catch (err) {
        setError('Failed to load fleet vehicles. Please try again.');
        console.error('Fleet loading error:', err);
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    init();
    return () => unsubscribe?.();
  }, [cacheKey, readCache, writeCache]);

  // Filter cars based on selected category
  const filteredCars = useMemo(() => {
    const availableCars = cars.length > 0 ? cars : [];

    if (selectedCategory === 'All') {
      return availableCars.slice(0, 6); // Show only first 6 cars for landing page
    }

    return availableCars
      .filter((car) => car.category.toLowerCase() === selectedCategory.toLowerCase())
      .slice(0, 6);
  }, [cars, selectedCategory]);

  return (
    <section
      className="py-16 2xl:py-[120px] bg-gradient-to-br from-background to-background/50"
      id="fleet"
    >
      <div className="container">
        {/* Header Section */}
        <motion.div
          className="max-w-[670px] mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl xl:text-4xl xl:leading-[52px] font-bold text-default-900 mb-4">
            Our Premium{' '}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Fleet
            </span>
          </h2>
          <p className="text-lg xl:leading-8 text-default-600 max-w-2xl mx-auto">
            Discover our diverse collection of well-maintained vehicles, from compact cars to luxury
            SUVs. Each vehicle is carefully selected to ensure your comfort and safety.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {categoryFilters.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-6 py-2.5 rounded-full font-medium transition-all duration-300 border-2',
                selectedCategory === category
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:text-primary'
              )}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <Skeleton className="h-48 lg:h-56 w-full" />
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <div className="text-center space-y-2">
                      <Skeleton className="h-8 w-8 mx-auto rounded-lg" />
                      <Skeleton className="h-4 w-12 mx-auto" />
                      <Skeleton className="h-3 w-10 mx-auto" />
                    </div>
                    <div className="text-center space-y-2">
                      <Skeleton className="h-8 w-8 mx-auto rounded-lg" />
                      <Skeleton className="h-4 w-12 mx-auto" />
                      <Skeleton className="h-3 w-10 mx-auto" />
                    </div>
                    <div className="text-center space-y-2">
                      <Skeleton className="h-8 w-8 mx-auto rounded-lg" />
                      <Skeleton className="h-4 w-12 mx-auto" />
                      <Skeleton className="h-3 w-10 mx-auto" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  </div>
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-red-500 dark:text-red-400 mb-4">
              <p className="text-lg font-medium">⚠️ Error Loading Fleet</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </motion.div>
        ) : filteredCars.length === 0 && cars.length === 0 ? (
          /* No Cars Available */
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No vehicles available at the moment.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Please check back later or contact support.
            </p>
          </motion.div>
        ) : filteredCars.length === 0 ? (
          /* No Results for Category */
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No vehicles found for "{selectedCategory}" category.
            </p>
            <Button onClick={() => setSelectedCategory('All')} variant="outline" className="mt-4">
              View All Vehicles
            </Button>
          </motion.div>
        ) : (
          /* Fleet Grid */
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {filteredCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FleetCarCard car={car} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FaCar className="w-5 h-5 mr-2" />
              Book Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              View Full Fleet
              <FaArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FleetShowcase;
