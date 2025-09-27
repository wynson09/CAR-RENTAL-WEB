'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CarFirebaseService } from '@/lib/firebase-car-service';
import { Timestamp } from 'firebase/firestore';
import { CarListing } from '@/data/car-listings-data';
import { Car } from '@/components/fleet';
import { toast } from 'sonner';

// Session cache key
const CARS_SESSION_CACHE_KEY = 'booking:cars';

// Convert CarListing data to Car data format for fleet display
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

export const useCarData = () => {
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

  const cacheKey = useMemo(() => 'all_cars', []);

  // Fetch cars; use cache first and attach realtime listener for updates
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
              console.error('Cars listener error:', error);
            }
          );
          return;
        }

        // No cache → fetch once and then attach listener
        const carListings = await CarFirebaseService.getAllCars();
        const convertedCars = uniqueByVehicleName(
          uniqueByDocId(carListings.map(convertCarListingToCar))
        );
        setCars(convertedCars);
        writeCache(convertedCars);
        toast.success(`Loaded ${convertedCars.length} vehicles`);

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
            console.error('Cars listener error:', error);
          }
        );
      } catch (err) {
        setError('Failed to load vehicles. Please try again.');
        toast.error('Failed to load vehicles');
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    init();
    return () => unsubscribe?.();
  }, [cacheKey, readCache, writeCache]);

  return {
    cars,
    loading,
    error,
  };
};
