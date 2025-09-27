/**
 * Dynamic Pricing System
 * Calculates discounts based on rental duration and promotional status
 * Base price: ₱3,500
 */

export interface PriceRange {
  minDays: number;
  maxDays: number;
  promoPrice: number;
  regularPrice: number;
}

export interface DynamicPricingResult {
  targetPrice: number;
  discountPercentage: number;
  discountAmount: number;
  zdsDiscountAmount: number;
  finalPrice: number;
  priceCategory: string;
}

// Base price configuration
export const BASE_PRICE = 3500;
export const ZDS_DISCOUNT_AMOUNT_REGULAR = 100; // For regular cars
export const ZDS_DISCOUNT_AMOUNT_PROMO = 200; // For promo cars
export const VERIFIED_USER_DISCOUNT = 500;
export const PROMO_VEHICLE_DISCOUNT = 100;

/**
 * Gets the appropriate ZDS discount amount based on car type
 */
export function getZDSDiscountAmount(isPromo: boolean): number {
  return isPromo ? ZDS_DISCOUNT_AMOUNT_PROMO : ZDS_DISCOUNT_AMOUNT_REGULAR;
}

// Price ranges based on user requirements
export const PRICE_RANGES: PriceRange[] = [
  { minDays: 1, maxDays: 1, promoPrice: 2900, regularPrice: 3000 },
  { minDays: 2, maxDays: 3, promoPrice: 2800, regularPrice: 2900 },
  { minDays: 4, maxDays: 5, promoPrice: 2700, regularPrice: 2800 },
  { minDays: 6, maxDays: 7, promoPrice: 2600, regularPrice: 2700 },
  { minDays: 8, maxDays: 10, promoPrice: 2500, regularPrice: 2600 },
  { minDays: 11, maxDays: 14, promoPrice: 2400, regularPrice: 2500 },
  { minDays: 15, maxDays: 21, promoPrice: 2200, regularPrice: 2300 },
  { minDays: 22, maxDays: 29, promoPrice: 2000, regularPrice: 2200 },
  { minDays: 30, maxDays: Infinity, promoPrice: 1900, regularPrice: 2000 },
];

/**
 * Gets the appropriate price range for a given number of days
 */
export function getPriceRange(days: number): PriceRange | null {
  return PRICE_RANGES.find((range) => days >= range.minDays && days <= range.maxDays) || null;
}

/**
 * Gets a descriptive label for the price range
 */
export function getPriceRangeLabel(days: number): string {
  if (days === 1) return '1 Day Rental';
  if (days >= 2 && days <= 3) return '2-3 Days Rental';
  if (days >= 4 && days <= 5) return '4-5 Days Rental';
  if (days >= 6 && days <= 7) return '6-7 Days Rental';
  if (days >= 8 && days <= 10) return '8-10 Days Rental';
  if (days >= 11 && days <= 14) return '11-14 Days Rental';
  if (days >= 15 && days <= 21) return '15-21 Days Rental';
  if (days >= 22 && days <= 29) return '22-29 Days Rental';
  if (days >= 30) return '30+ Days Rental';
  return 'Standard Rental';
}

/**
 * Calculates dynamic pricing based on duration, promotional status, and ZDS location
 * The price ranges include all discounts, so this determines the final target price
 */
export function calculateDynamicPricing(
  originalPrice: number,
  days: number,
  isPromo: boolean,
  withInZDS: boolean = false
): DynamicPricingResult {
  // Only apply dynamic pricing if the original price matches our base price
  const shouldApplyDynamicPricing = Math.abs(originalPrice - BASE_PRICE) < 100;

  if (!shouldApplyDynamicPricing) {
    // Fallback for non-standard base prices
    return {
      targetPrice: originalPrice,
      discountPercentage: 0,
      discountAmount: 0,
      zdsDiscountAmount: withInZDS ? getZDSDiscountAmount(isPromo) : 0,
      finalPrice: originalPrice - (withInZDS ? getZDSDiscountAmount(isPromo) : 0),
      priceCategory: 'Standard Pricing',
    };
  }

  const priceRange = getPriceRange(days);

  if (!priceRange) {
    // Fallback if no range found
    return {
      targetPrice: originalPrice,
      discountPercentage: 0,
      discountAmount: 0,
      zdsDiscountAmount: withInZDS ? getZDSDiscountAmount(isPromo) : 0,
      finalPrice: originalPrice - (withInZDS ? getZDSDiscountAmount(isPromo) : 0),
      priceCategory: 'Standard Pricing',
    };
  }

  // Get base target price (before ZDS discount)
  let targetPrice = isPromo ? priceRange.promoPrice : priceRange.regularPrice;

  // Apply ZDS discount if applicable (subtract ₱100/₱200 from the price range)
  const zdsDiscountAmount = withInZDS ? getZDSDiscountAmount(isPromo) : 0;
  const finalPrice = targetPrice - zdsDiscountAmount;

  // Calculate total discount from original price to final price
  const totalDiscountAmount = BASE_PRICE - finalPrice;
  const discountPercentage = (totalDiscountAmount / BASE_PRICE) * 100;

  return {
    targetPrice,
    discountPercentage,
    discountAmount: totalDiscountAmount,
    zdsDiscountAmount,
    finalPrice,
    priceCategory: isPromo ? 'Promotional Pricing' : 'Regular Pricing',
  };
}

/**
 * Converts dynamic pricing result to individual discount breakdown format
 * Shows each discount separately with fixed amounts
 */
export function createDiscountBreakdown(
  originalPrice: number,
  days: number,
  isPromo: boolean,
  isVerifiedUser: boolean = false,
  withInZDS: boolean = false
) {
  const discountBreakdown = [];
  let runningPrice = originalPrice;

  // 1. Verified User Discount (₱500 off base price)
  if (isVerifiedUser) {
    const verifiedDiscountAmount = VERIFIED_USER_DISCOUNT;
    const verifiedDiscountPercentage = (verifiedDiscountAmount / originalPrice) * 100;

    discountBreakdown.push({
      name: 'Verified User Discount',
      percentage: verifiedDiscountPercentage,
      amount: verifiedDiscountAmount,
      type: 'verified',
    });
    runningPrice -= verifiedDiscountAmount;
  }

  // 2. Promotional Vehicle Discount (₱100 off base price)
  if (isPromo) {
    const promoDiscountAmount = PROMO_VEHICLE_DISCOUNT;
    const promoDiscountPercentage = (promoDiscountAmount / originalPrice) * 100;

    discountBreakdown.push({
      name: 'Promotional Vehicle',
      percentage: promoDiscountPercentage,
      amount: promoDiscountAmount,
      type: 'promo',
    });
    runningPrice -= promoDiscountAmount;
  }

  // 3. Duration-based Discount (only for verified users on longer rentals)
  // For non-verified users: no duration discounts, just use base price minus promo discount
  // For verified users: your price ranges apply
  const priceRange = getPriceRange(days);
  if (priceRange && isVerifiedUser) {
    // Only apply duration discounts for verified users
    // Your target prices are for verified users with all discounts included
    const targetPriceBeforeZDS = isPromo ? priceRange.promoPrice : priceRange.regularPrice;

    // Calculate what the duration discount should be to reach the target
    // Target = Base - Verified - Promo - Duration (before ZDS)
    // Duration = Base - Verified - Promo - Target
    const priceAfterFixedDiscounts = runningPrice;
    const durationDiscountAmount = Math.max(0, priceAfterFixedDiscounts - targetPriceBeforeZDS);

    if (durationDiscountAmount > 0) {
      const durationDiscountPercentage = (durationDiscountAmount / originalPrice) * 100;
      const rangeLabel = getPriceRangeLabel(days);

      discountBreakdown.push({
        name: rangeLabel,
        percentage: durationDiscountPercentage,
        amount: durationDiscountAmount,
        type: 'duration',
      });
      runningPrice -= durationDiscountAmount;
    }
  }

  // 4. ZDS Discount (₱100 for regular, ₱200 for promo)
  if (withInZDS) {
    const zdsDiscountAmount = getZDSDiscountAmount(isPromo);
    const zdsDiscountPercentage = (zdsDiscountAmount / originalPrice) * 100;

    discountBreakdown.push({
      name: 'Within Zamboanga Del Sur',
      percentage: zdsDiscountPercentage,
      amount: zdsDiscountAmount,
      type: 'location',
    });
    runningPrice -= zdsDiscountAmount;
  }

  return discountBreakdown;
}

/**
 * Calculates final price with all discounts applied
 * Now calculates step by step using individual discounts
 */
export function calculateFinalPrice(
  originalPrice: number,
  days: number,
  isPromo: boolean,
  isVerifiedUser: boolean = false,
  withInZDS: boolean = false
) {
  let finalPrice = originalPrice;

  // Apply individual discounts in order
  const discountBreakdown = createDiscountBreakdown(
    originalPrice,
    days,
    isPromo,
    isVerifiedUser,
    withInZDS
  );

  // Sum all discounts
  const totalDiscounts = discountBreakdown.reduce((sum, discount) => sum + discount.amount, 0);
  finalPrice = originalPrice - totalDiscounts;

  return Math.max(0, finalPrice);
}
