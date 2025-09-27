'use client';

import { Separator } from '@/components/ui/separator';

interface Discount {
  label: string;
  type: string;
  percent: number;
  amount: number;
  applied: boolean;
}

interface ExtraCharge {
  label: string;
  type: string;
  amount: number;
}

interface PriceBreakdownProps {
  pricePerDay: number;
  totalDuration: number;
  driveOption: 'self-drive' | 'with-driver';
  driverPerDay?: number;
  discounts?: Discount[];
  extraCharges?: ExtraCharge[];
  totalAmount: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const PriceBreakdown = ({
  pricePerDay,
  totalDuration,
  driveOption,
  driverPerDay,
  discounts = [],
  extraCharges = [],
  totalAmount,
}: PriceBreakdownProps) => {
  const appliedDiscounts = discounts.filter((d) => d.applied);
  const totalSavings = appliedDiscounts.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        💰 Price Breakdown
      </h4>

      {/* Base Vehicle Rate */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
        <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">🚗 Vehicle Rate</h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Rate per day:</span>
            <span className="font-medium">{formatCurrency(pricePerDay)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
            <span className="font-medium">
              {totalDuration} day{totalDuration !== 1 ? 's' : ''}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-center font-semibold">
            <span>Vehicle Subtotal:</span>
            <span className="text-lg">{formatCurrency(pricePerDay * totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Driver Service (if applicable) */}
      {driveOption === 'with-driver' && driverPerDay && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2 border border-blue-200 dark:border-blue-800">
          <h5 className="font-semibold text-blue-700 dark:text-blue-300 text-sm">
            👨‍✈️ Driver Service
          </h5>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center text-blue-700 dark:text-blue-300">
              <span>Driver fee per day:</span>
              <span className="font-medium">{formatCurrency(driverPerDay)}</span>
            </div>
            <div className="flex justify-between items-center text-blue-700 dark:text-blue-300">
              <span>Duration:</span>
              <span className="font-medium">
                {totalDuration} day{totalDuration !== 1 ? 's' : ''}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center font-semibold text-blue-700 dark:text-blue-300">
              <span>Driver Subtotal:</span>
              <span>{formatCurrency(driverPerDay * totalDuration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Applied Discounts */}
      {appliedDiscounts.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-2 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <h5 className="font-semibold text-green-700 dark:text-green-300 text-sm uppercase tracking-wider">
              Applied Discounts
            </h5>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white border border-green-600">
              {appliedDiscounts.length} discount{appliedDiscounts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* All discounts from booking data (including ZDS) */}
          {appliedDiscounts.map((discount, index) => {
            const perDayAmount = discount.amount / totalDuration;
            return (
              <div
                key={`discount-${index}`}
                className="flex flex-col space-y-1 text-sm text-green-700 dark:text-green-300"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {discount.label} ({discount.percent.toFixed(1)}% off)
                  </span>
                  <span className="font-bold">-{formatCurrency(discount.amount)}</span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Discount per day: -{formatCurrency(perDayAmount)} × {totalDuration} day
                  {totalDuration !== 1 ? 's' : ''} = -{formatCurrency(discount.amount)}
                </div>
              </div>
            );
          })}

          {/* Total Savings */}
          <div className="bg-green-100 dark:bg-green-800/20 rounded-lg p-3 border border-green-300 dark:border-green-700">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-green-700 dark:text-green-300">
                Total Savings
              </span>
              <span className="font-bold text-xl text-green-700 dark:text-green-300">
                -{formatCurrency(totalSavings)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Extra Charges */}
      {extraCharges.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 space-y-2 border border-orange-200 dark:border-orange-800">
          <h5 className="font-semibold text-orange-700 dark:text-orange-300 text-sm">
            📋 Additional Charges
          </h5>
          {extraCharges.map((charge, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-sm text-orange-700 dark:text-orange-300"
            >
              <span>{charge.label}</span>
              <span className="font-medium">+{formatCurrency(charge.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Final Total */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-blue-100 text-sm">Total Amount Due</span>
            <div className="font-bold text-2xl">{formatCurrency(totalAmount)}</div>
            <div className="text-blue-200 text-sm mt-1">💡 Payment collected at pickup</div>
          </div>
          <div className="text-right">
            <div className="text-blue-200 text-sm">
              {totalDuration} day{totalDuration !== 1 ? 's' : ''}
            </div>
            <div className="font-semibold text-lg">
              {formatCurrency(totalAmount / totalDuration)}/day avg
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
