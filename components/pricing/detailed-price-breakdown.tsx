'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export interface DetailedPricingData {
  // Basic pricing
  basePricePerDay: number;
  totalDays: number;
  baseSubtotal: number; // basePricePerDay * totalDays

  // Driver fee (if applicable)
  driverFeePerDay?: number;
  driverSubtotal?: number; // driverFeePerDay * totalDays

  // Discounts with detailed breakdown
  discounts: {
    label: string;
    type: string;
    percent: number;
    amountPerDay: number; // discount amount per day
    totalAmount: number; // amountPerDay * totalDays
    applied: boolean;
  }[];

  // Extra charges
  extraCharges: {
    label: string;
    type: string;
    amountPerDay?: number;
    totalAmount: number;
  }[];

  // Totals
  subtotalBeforeDiscounts: number;
  totalDiscounts: number;
  totalSavings: number;
  finalTotal: number;
}

interface DetailedPriceBreakdownProps {
  pricing: DetailedPricingData;
  vehicleName?: string;
  className?: string;
  showHeader?: boolean;
  compact?: boolean;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const DetailedPriceBreakdown = ({
  pricing,
  vehicleName,
  className,
  showHeader = true,
  compact = false,
}: DetailedPriceBreakdownProps) => {
  const appliedDiscounts = pricing.discounts.filter((d) => d.applied);
  const hasDriverFee = pricing.driverFeePerDay && pricing.driverFeePerDay > 0;

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">💰 Pricing Breakdown</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Base Vehicle Rental */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Vehicle Rental
          </h4>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Base rate per day</span>
              <span className="font-medium">{formatCurrency(pricing.basePricePerDay)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">
                {pricing.totalDays} day{pricing.totalDays !== 1 ? 's' : ''}
              </span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between items-center">
              <span className="font-medium">Vehicle Subtotal</span>
              <span className="font-bold text-lg">{formatCurrency(pricing.baseSubtotal)}</span>
            </div>

            {!compact && (
              <div className="text-xs text-muted-foreground text-center">
                {formatCurrency(pricing.basePricePerDay)} × {pricing.totalDays} day
                {pricing.totalDays !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Driver Fee (if applicable) */}
        {hasDriverFee && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Driver Service
            </h4>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2 border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700 dark:text-blue-300">Driver fee per day</span>
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {formatCurrency(pricing.driverFeePerDay!)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700 dark:text-blue-300">Duration</span>
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {pricing.totalDays} day{pricing.totalDays !== 1 ? 's' : ''}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  Driver Subtotal
                </span>
                <span className="font-bold text-lg text-blue-700 dark:text-blue-300">
                  {formatCurrency(pricing.driverSubtotal!)}
                </span>
              </div>

              {!compact && (
                <div className="text-xs text-blue-600 dark:text-blue-400 text-center">
                  {formatCurrency(pricing.driverFeePerDay!)} × {pricing.totalDays} day
                  {pricing.totalDays !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Extra Charges (if any) */}
        {pricing.extraCharges.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Additional Charges
            </h4>

            {pricing.extraCharges.map((charge, index) => (
              <div
                key={index}
                className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-orange-700 dark:text-orange-300">
                      {charge.label}
                    </span>
                    {charge.amountPerDay && !compact && (
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        {formatCurrency(charge.amountPerDay)} × {pricing.totalDays} day
                        {pricing.totalDays !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-orange-700 dark:text-orange-300">
                    +{formatCurrency(charge.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subtotal Before Discounts */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Subtotal (before discounts)
            </span>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              {formatCurrency(pricing.subtotalBeforeDiscounts)}
            </span>
          </div>
        </div>

        {/* Applied Discounts */}
        {appliedDiscounts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-green-700 dark:text-green-300 uppercase tracking-wider">
                Applied Discounts
              </h4>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {appliedDiscounts.length} discount{appliedDiscounts.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {appliedDiscounts.map((discount, index) => (
              <div
                key={index}
                className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-2 border border-green-200 dark:border-green-800"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="font-medium text-green-700 dark:text-green-300">
                      {discount.label}
                    </span>
                    <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                      {discount.percent}% OFF
                    </Badge>
                  </div>
                  <span className="font-bold text-green-700 dark:text-green-300">
                    -{formatCurrency(discount.totalAmount)}
                  </span>
                </div>

                {!compact && (
                  <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                    <div>Discount per day: -{formatCurrency(discount.amountPerDay)}</div>
                    <div>
                      Total discount: -{formatCurrency(discount.amountPerDay)} × {pricing.totalDays}{' '}
                      day{pricing.totalDays !== 1 ? 's' : ''} = -
                      {formatCurrency(discount.totalAmount)}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="bg-green-100 dark:bg-green-800/20 rounded-lg p-3 border-2 border-green-300 dark:border-green-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-green-700 dark:text-green-300">
                  Total Savings
                </span>
                <span className="font-bold text-xl text-green-700 dark:text-green-300">
                  -{formatCurrency(pricing.totalSavings)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Final Total */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-blue-100 text-sm">Final Total</span>
              <div className="font-bold text-2xl">{formatCurrency(pricing.finalTotal)}</div>
              {pricing.totalSavings > 0 && (
                <div className="text-blue-200 text-sm mt-1">
                  You save {formatCurrency(pricing.totalSavings)} (
                  {((pricing.totalSavings / pricing.subtotalBeforeDiscounts) * 100).toFixed(1)}%)
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-blue-200 text-sm">
                {pricing.totalDays} day{pricing.totalDays !== 1 ? 's' : ''}
              </div>
              <div className="font-semibold text-lg">
                {formatCurrency(pricing.finalTotal / pricing.totalDays)}/day
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailedPriceBreakdown;
