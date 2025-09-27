'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInCalendarDays } from 'date-fns';
import { useMemo, useState } from 'react';
import { useUserStore } from '@/store';
import { QuotationDialog } from './quotation-dialog';
import {
  calculateDynamicPricing,
  createDiscountBreakdown,
  calculateFinalPrice,
  BASE_PRICE,
} from '@/lib/dynamic-pricing';

export interface Car {
  id: number;
  name: string;
  image: string;
  price: string;
  isPromo: boolean;
  category: string;
  passengers: string;
  bags: string;
  transmission: string;
  features: string[];
}

export interface DiscountItem {
  name: string;
  percentage: number;
  amount: number;
  type: 'base' | 'promo' | 'duration' | 'verified' | 'location';
}

export interface PricingResult {
  originalPrice: number;
  discountedPrice: number;
  totalDiscount: number;
  dayDuration: number;
  hasDiscount: boolean;
  discountBreakdown: DiscountItem[];
  totalSavings: number;
}

interface CarCardProps {
  car: Car;
  onBookNow?: (car: Car) => void;
  className?: string;
  pickupDate?: Date;
  returnDate?: Date;
  driveOption?: 'self-drive' | 'with-driver';
  withInZDS?: boolean;
}

// Constants for discount configuration
const DISCOUNT_CONFIG = {
  VERIFIED_USER: 0.05,
  PROMO_CAR: 0.1,
  DURATION_TIERS: [
    { maxDays: 1, additionalDiscount: 0 },
    { maxDays: 3, additionalDiscount: 0.025 },
    { maxDays: 7, additionalDiscount: 0.05 },
    { maxDays: 14, additionalDiscount: 0.1 },
    { maxDays: 21, additionalDiscount: 0.2 },
    { maxDays: 29, additionalDiscount: 0.25 },
    { maxDays: Infinity, additionalDiscount: 0.3 },
  ],
} as const;

// Driver fee per day
const DRIVER_FEE_PER_DAY = 750;

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3ECar Image%3C/text%3E%3C/svg%3E";

/**
 * Extracts numeric value from price string (e.g., "₱2,500/day" -> 2500)
 */
const extractPriceValue = (priceString: string): number => {
  // Remove currency symbols, commas, and text, then parse
  const cleanPrice = priceString.replace(/[₱$,]/g, '').replace(/\/day|per day|\/日|day/gi, '');
  return parseFloat(cleanPrice) || 0;
};

/**
 * Calculates pricing information including discounts based on rental duration
 * Now uses dynamic pricing system based on user-defined price ranges
 */
const calculatePricing = (
  basePrice: string,
  isPromo: boolean,
  dayDuration: number,
  isVerifiedUser: boolean = false,
  driveOption: 'self-drive' | 'with-driver' = 'self-drive',
  withInZDS: boolean = false
): PricingResult => {
  const originalPrice = extractPriceValue(basePrice);

  if (originalPrice === 0) {
    return {
      originalPrice: 0,
      discountedPrice: 0,
      totalDiscount: 0,
      dayDuration,
      hasDiscount: false,
      discountBreakdown: [],
      totalSavings: 0,
    };
  }

  // Use dynamic pricing system to get discount breakdown
  const discountBreakdown = createDiscountBreakdown(
    originalPrice,
    dayDuration,
    isPromo,
    isVerifiedUser,
    withInZDS
  );

  // Calculate final price using dynamic pricing
  const finalPricePerDay = calculateFinalPrice(
    originalPrice,
    dayDuration,
    isPromo,
    isVerifiedUser,
    withInZDS
  );

  // Calculate total savings from discounts
  const totalSavings = discountBreakdown.reduce((sum, discount) => sum + discount.amount, 0);
  const totalDiscount = totalSavings / originalPrice;

  // Add driver fee if with-driver option is selected
  const driverFee = driveOption === 'with-driver' ? DRIVER_FEE_PER_DAY : 0;
  const finalPriceWithDriver = finalPricePerDay + driverFee;

  return {
    originalPrice: originalPrice + driverFee, // Show total original price including driver if selected
    discountedPrice: finalPriceWithDriver,
    totalDiscount: totalSavings / originalPrice, // Keep discount percentage based on car price only
    dayDuration,
    hasDiscount: totalSavings > 0,
    discountBreakdown: discountBreakdown.map((discount) => ({
      name: discount.name,
      percentage: discount.percentage,
      amount: discount.amount,
      type: discount.type as 'base' | 'promo' | 'duration' | 'verified' | 'location',
    })),
    totalSavings,
  };
};

/**
 * Formats price for display using PHP peso currency
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Gets the clean car name without promotional prefixes
 */
const getCleanCarName = (name: string): string => {
  return name.replace(/🔥\s*/, '');
};

/**
 * Checks if car has promotional badge
 */
const hasPromoBadge = (name: string): boolean => {
  return name.includes('🔥');
};

export const CarCard = ({
  car,
  onBookNow,
  className,
  pickupDate,
  returnDate,
  driveOption = 'self-drive',
  withInZDS = false,
}: CarCardProps) => {
  // Get user verification status from Zustand store
  const { user } = useUserStore();
  const isVerifiedUser = user?.isVerified ?? false;

  // Quotation dialog state
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);

  // Debug logging - remove in production
  // console.log('CarCard Debug:', { user, isVerifiedUser, userExists: !!user });

  const dayDuration = useMemo(() => {
    if (!pickupDate || !returnDate) return 0;
    return Math.max(0, differenceInCalendarDays(returnDate, pickupDate));
  }, [pickupDate, returnDate]);

  const pricing = useMemo(
    () =>
      calculatePricing(car.price, car.isPromo, dayDuration, isVerifiedUser, driveOption, withInZDS),
    [car.price, car.isPromo, dayDuration, isVerifiedUser, driveOption, withInZDS]
  );

  const handleBookNow = () => {
    onBookNow?.(car);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (!target.src.includes('placeholder')) {
      target.src = PLACEHOLDER_IMAGE;
    }
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group border border-gray-200 dark:border-gray-700 flex flex-col h-full',
        className
      )}
    >
      {/* Car Image */}
      <div className="sm:h-64 h-48 relative bg-white flex items-center justify-center overflow-hidden">
        {/* Promotional badge */}
        {hasPromoBadge(car.name) && (
          <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg animate-promo-badge border-2 border-white">
            PROMO
          </div>
        )}

        <Image
          src={car.image}
          alt={getCleanCarName(car.name)}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="md:object-cover object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
      </div>

      {/* Car Details */}
      <div className="p-4 flex flex-col flex-1">
        {/* Content Area */}
        <div className="flex-1">
          {/* Car Name */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
            {getCleanCarName(car.name)}
          </h3>

          {/* Verification Promotion */}
          {!isVerifiedUser && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <div className="text-sm">
                  <span className="font-medium">Get ₱500 extra discount!</span>
                  <span className="text-amber-700 dark:text-amber-300">
                    {' '}
                    Verify your account to unlock exclusive savings.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Pricing Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 mb-4 border border-blue-100 dark:border-gray-700 min-h-[200px] flex flex-col">
            {/* Header with Duration */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {pickupDate && returnDate
                    ? `${dayDuration} day${dayDuration !== 1 ? 's' : ''} rental`
                    : '1 day rental'}
                </span>
                <div className="flex items-center gap-2">
                  {driveOption === 'with-driver' && (
                    <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      WITH DRIVER
                    </div>
                  )}
                </div>
              </div>
              {pricing.hasDiscount && (
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-bold">
                  {Math.round(pricing.totalDiscount * 100)}% OFF
                </div>
              )}
            </div>

            {/* Price Display - Consistent layout */}
            <div className="flex-1 flex flex-col space-y-3">
              {pricing.hasDiscount ? (
                <>
                  {/* Original Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {driveOption === 'with-driver'
                        ? 'Car + Driver (per day):'
                        : 'Base Price (per day):'}
                    </span>
                    <span className="text-lg font-bold text-gray-500 line-through">
                      {formatPrice(pricing.originalPrice)}
                    </span>
                  </div>
                </>
              ) : (
                /* Single Price Display for No Discount */
                <>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {driveOption === 'with-driver'
                        ? 'Car + Driver (per day):'
                        : 'Price (per day):'}
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(pricing.originalPrice)}
                    </span>
                  </div>
                  {/* Spacer to maintain consistent card height */}
                  <div className="flex-1 min-h-[60px] flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <div className="text-xs opacity-60">✨ Great value rental</div>
                    </div>
                  </div>
                </>
              )}

              {/* Driver Fee Breakdown (if with driver) */}
              {driveOption === 'with-driver' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-2">
                  <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Car Base Price:</span>
                      <span>{formatPrice(extractPriceValue(car.price))}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Professional Driver:</span>
                      <span>+{formatPrice(DRIVER_FEE_PER_DAY)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Discount Section - Only show when there are discounts */}
              {pricing.hasDiscount && (
                <>
                  {/* Discount Breakdown */}
                  {pricing.discountBreakdown.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        Applied Discounts:
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-md p-3 space-y-1.5 border border-gray-200 dark:border-gray-600">
                        {pricing.discountBreakdown.map((discount, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  discount.type === 'promo' && 'bg-red-500',
                                  discount.type === 'verified' && 'bg-blue-500',
                                  discount.type === 'base' && 'bg-green-500',
                                  discount.type === 'duration' && 'bg-purple-500',
                                  discount.type === 'location' && 'bg-orange-500'
                                )}
                              ></div>
                              <span className="text-gray-600 dark:text-gray-400">
                                {discount.name}
                              </span>
                            </div>
                            <div className="flex justify-end text-right w-full sm:w-auto gap-2">
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                -{discount.percentage.toFixed(1)}%
                              </span>
                              <span className="text-green-600 dark:text-green-400 font-bold">
                                -{formatPrice(discount.amount)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Final Discounted Price */}
                  <div className="border-t border-blue-200 dark:border-gray-600 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Your Price (per day):
                      </span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatPrice(pricing.discountedPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Total Savings Highlight */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-2">
                    <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      <span className="text-sm font-bold">
                        Total Savings: {formatPrice(pricing.totalSavings)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Car Specs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4 text-base text-gray-600 dark:text-gray-400 border-y border-gray-200 dark:border-gray-700 py-4">
            <div className="flex items-center gap-1">
              <Users className="h-5 w-5 text-primary-500" />
              <span>{car.passengers}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-5 w-5 text-primary-500" />
              <span>{car.bags}</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="h-5 w-5 text-primary-500" />
              <span>{car.transmission}</span>
            </div>
          </div>

          {/* Features */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-1 text-sm text-gray-600 dark:text-gray-400">
              {car.features.slice(0, 8).map((feature, index) => (
                <div key={`${car.id}-feature-${index}`} className="flex items-center">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
                  <span className="truncate">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 dark:border-blue-400 dark:text-blue-400"
            onClick={() => setIsQuotationOpen(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            QUOTATION
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleBookNow}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            BOOK NOW
          </Button>
        </div>
      </div>

      {/* Quotation Dialog */}
      <QuotationDialog
        isOpen={isQuotationOpen}
        onClose={() => setIsQuotationOpen(false)}
        car={car}
        pickupDate={pickupDate}
        returnDate={returnDate}
        driveOption={driveOption}
        pricing={pricing}
      />
    </div>
  );
};
