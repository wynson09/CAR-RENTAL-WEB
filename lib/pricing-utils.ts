import { DetailedPricingData } from '@/components/pricing/detailed-price-breakdown';

export interface BasicPricingData {
  basePrice: number;
  totalDays: number;
  discounts: {
    label: string;
    type: string;
    percent: number;
    amount: number;
    applied: boolean;
  }[];
  extraCharges: {
    label: string;
    type: string;
    amount: number;
  }[];
  totalAmount: number;
  totalSavings: number;
}

export interface BookingPricingOptions {
  driverFeePerDay?: number;
  includeDriverInCalculation?: boolean;
}

/**
 * Converts basic pricing data to detailed pricing format
 */
export const convertToDetailedPricing = (
  basicPricing: BasicPricingData,
  options: BookingPricingOptions = {}
): DetailedPricingData => {
  const { driverFeePerDay = 0, includeDriverInCalculation = false } = options;

  const basePricePerDay = basicPricing.basePrice;
  const totalDays = basicPricing.totalDays;
  const baseSubtotal = basePricePerDay * totalDays;

  // Driver fee calculations
  const hasDriverFee = driverFeePerDay > 0;
  const driverSubtotal = hasDriverFee ? driverFeePerDay * totalDays : 0;

  // Convert discounts to detailed format
  const detailedDiscounts = basicPricing.discounts.map((discount) => ({
    label: discount.label,
    type: discount.type,
    percent: discount.percent,
    amountPerDay: discount.amount / totalDays, // Calculate per-day discount
    totalAmount: discount.amount,
    applied: discount.applied,
  }));

  // Convert extra charges to detailed format
  const detailedExtraCharges = basicPricing.extraCharges.map((charge) => ({
    label: charge.label,
    type: charge.type,
    amountPerDay: charge.amount / totalDays, // Assume extra charges are also per-day based
    totalAmount: charge.amount,
  }));

  // Calculate totals
  const extraChargesTotal = detailedExtraCharges.reduce(
    (sum, charge) => sum + charge.totalAmount,
    0
  );
  const subtotalBeforeDiscounts = baseSubtotal + driverSubtotal + extraChargesTotal;
  const totalDiscounts = detailedDiscounts
    .filter((d) => d.applied)
    .reduce((sum, discount) => sum + discount.totalAmount, 0);

  const finalTotal = subtotalBeforeDiscounts - totalDiscounts;

  return {
    basePricePerDay,
    totalDays,
    baseSubtotal,
    driverFeePerDay: hasDriverFee ? driverFeePerDay : undefined,
    driverSubtotal: hasDriverFee ? driverSubtotal : undefined,
    discounts: detailedDiscounts,
    extraCharges: detailedExtraCharges,
    subtotalBeforeDiscounts,
    totalDiscounts,
    totalSavings: totalDiscounts,
    finalTotal,
  };
};

/**
 * Creates detailed pricing data from scratch with proper per-day calculations
 */
export const createDetailedPricing = (params: {
  basePricePerDay: number;
  totalDays: number;
  driverFeePerDay?: number;
  discounts?: {
    label: string;
    type: string;
    percentageOff: number; // The percentage discount (e.g., 10 for 10%)
    appliedTo: 'vehicle' | 'total' | 'driver'; // What the discount applies to
    applied: boolean;
  }[];
  extraCharges?: {
    label: string;
    type: string;
    amountPerDay?: number;
    totalAmount?: number;
  }[];
}): DetailedPricingData => {
  const {
    basePricePerDay,
    totalDays,
    driverFeePerDay = 0,
    discounts = [],
    extraCharges = [],
  } = params;

  const baseSubtotal = basePricePerDay * totalDays;
  const hasDriverFee = driverFeePerDay > 0;
  const driverSubtotal = hasDriverFee ? driverFeePerDay * totalDays : 0;

  // Process extra charges
  const processedExtraCharges = extraCharges.map((charge) => ({
    label: charge.label,
    type: charge.type,
    amountPerDay: charge.amountPerDay || (charge.totalAmount ? charge.totalAmount / totalDays : 0),
    totalAmount: charge.totalAmount || (charge.amountPerDay ? charge.amountPerDay * totalDays : 0),
  }));

  const extraChargesTotal = processedExtraCharges.reduce(
    (sum, charge) => sum + charge.totalAmount,
    0
  );
  const subtotalBeforeDiscounts = baseSubtotal + driverSubtotal + extraChargesTotal;

  // Process discounts with proper per-day calculations
  const processedDiscounts = discounts.map((discount) => {
    let discountBase = 0;

    switch (discount.appliedTo) {
      case 'vehicle':
        discountBase = baseSubtotal;
        break;
      case 'driver':
        discountBase = driverSubtotal;
        break;
      case 'total':
        discountBase = subtotalBeforeDiscounts;
        break;
    }

    const totalAmount = (discountBase * discount.percentageOff) / 100;
    const amountPerDay = totalAmount / totalDays;

    return {
      label: discount.label,
      type: discount.type,
      percent: discount.percentageOff,
      amountPerDay,
      totalAmount,
      applied: discount.applied,
    };
  });

  const totalDiscounts = processedDiscounts
    .filter((d) => d.applied)
    .reduce((sum, discount) => sum + discount.totalAmount, 0);

  const finalTotal = subtotalBeforeDiscounts - totalDiscounts;

  return {
    basePricePerDay,
    totalDays,
    baseSubtotal,
    driverFeePerDay: hasDriverFee ? driverFeePerDay : undefined,
    driverSubtotal: hasDriverFee ? driverSubtotal : undefined,
    discounts: processedDiscounts,
    extraCharges: processedExtraCharges,
    subtotalBeforeDiscounts,
    totalDiscounts,
    totalSavings: totalDiscounts,
    finalTotal,
  };
};

/**
 * Format currency for consistent display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate savings percentage
 */
export const calculateSavingsPercentage = (originalPrice: number, finalPrice: number): number => {
  if (originalPrice <= 0) return 0;
  return ((originalPrice - finalPrice) / originalPrice) * 100;
};
