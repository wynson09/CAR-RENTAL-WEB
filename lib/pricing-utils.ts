import { SelectedVehicle } from './firebase-booking-service';
import { calculateFinalPrice, ZDS_DISCOUNT_AMOUNT } from './dynamic-pricing';

export interface PricingCalculationInput {
  basePrice: number;
  totalDuration: number;
  withInZDS: boolean;
  driveOption: 'self-drive' | 'with-driver';
  driverPerDay?: number;
  extraCharges?: Array<{ label: string; type: string; amount: number }>;
  discounts?: Array<{
    label: string;
    type: string;
    percent: number;
    amount: number;
    applied: boolean;
  }>;
}

export interface PricingCalculationResult {
  adjustedBasePrice: number; // Base price after ZDS adjustment
  baseTotalAmount: number; // Adjusted base price * duration
  driverCost: number;
  extraChargesTotal: number;
  discountsTotal: number;
  finalTotal: number;
  zdsDiscount: number; // Amount discounted for ZDS
}

/**
 * Calculate pricing for a booking with ZDS (Zamboanga Del Sur) logic
 * If withInZDS is true, subtract ₱200 from the base price before calculations
 */
export function calculateBookingPricing(input: PricingCalculationInput): PricingCalculationResult {
  const {
    basePrice,
    totalDuration,
    withInZDS,
    driveOption,
    driverPerDay = 0,
    extraCharges = [],
    discounts = [],
  } = input;

  // Apply ZDS discount to base price using new dynamic pricing
  const zdsDiscount = withInZDS ? ZDS_DISCOUNT_AMOUNT : 0;
  const adjustedBasePrice = Math.max(0, basePrice - zdsDiscount); // Ensure price doesn't go negative

  // Calculate base total with adjusted price
  const baseTotalAmount = adjustedBasePrice * totalDuration;

  // Calculate driver cost
  const driverCost = driveOption === 'with-driver' ? driverPerDay * totalDuration : 0;

  // Calculate extra charges total
  const extraChargesTotal = extraCharges.reduce((sum, charge) => sum + charge.amount, 0);

  // Calculate discounts total
  const discountsTotal = discounts
    .filter((discount) => discount.applied)
    .reduce((sum, discount) => sum + discount.amount, 0);

  // Calculate final total
  const finalTotal = Math.max(0, baseTotalAmount + driverCost + extraChargesTotal - discountsTotal);

  return {
    adjustedBasePrice,
    baseTotalAmount,
    driverCost,
    extraChargesTotal,
    discountsTotal,
    finalTotal,
    zdsDiscount,
  };
}

/**
 * Update SelectedVehicle with new pricing calculation
 */
export function updateSelectedVehiclePricing(
  selectedVehicle: SelectedVehicle,
  withInZDS: boolean,
  driveOption: 'self-drive' | 'with-driver',
  driverPerDay?: number
): SelectedVehicle {
  const pricingResult = calculateBookingPricing({
    basePrice: selectedVehicle.basePrice,
    totalDuration: selectedVehicle.totalDuration,
    withInZDS,
    driveOption,
    driverPerDay,
    extraCharges: selectedVehicle.extraCharges,
    discounts: selectedVehicle.discounts,
  });

  return {
    ...selectedVehicle,
    pricePerDay: pricingResult.adjustedBasePrice,
    totalAmount: pricingResult.finalTotal,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString()}`;
}

/**
 * Get ZDS pricing explanation text
 */
export function getZDSPricingExplanation(withInZDS: boolean, zdsDiscount: number): string {
  if (withInZDS && zdsDiscount > 0) {
    return `Within Zamboanga Del Sur - ${formatCurrency(zdsDiscount)} discount applied`;
  }
  return '';
}

/**
 * Legacy function for compatibility with existing code
 * @deprecated Use calculateBookingPricing instead
 */
export function createDetailedPricing(params: {
  basePricePerDay?: number;
  totalDays?: number;
  driverFeePerDay?: number;
  discounts?: any[];
  extraCharges?: any[];
  withInZDS?: boolean;
}) {
  const {
    basePricePerDay = 0,
    totalDays = 1,
    driverFeePerDay = 0,
    discounts = [],
    extraCharges = [],
    withInZDS = false,
  } = params;

  const result = calculateBookingPricing({
    basePrice: basePricePerDay,
    totalDuration: totalDays,
    withInZDS,
    driveOption: driverFeePerDay > 0 ? 'with-driver' : 'self-drive',
    driverPerDay: driverFeePerDay,
    extraCharges: extraCharges.map((charge) => ({
      label: charge.label || '',
      type: charge.type || '',
      amount: charge.amount || 0,
    })),
    discounts: discounts.map((discount) => ({
      label: discount.label || '',
      type: discount.type || '',
      percent: discount.percentageOff || 0,
      amount: discount.amount || 0,
      applied: discount.applied || false,
    })),
  });

  return {
    basePrice: result.adjustedBasePrice,
    totalDays,
    subtotal: result.baseTotalAmount,
    driverCost: result.driverCost,
    finalTotal: result.finalTotal,
    extraCharges: extraCharges,
    discounts: discounts,
    zdsDiscount: result.zdsDiscount,
  };
}
