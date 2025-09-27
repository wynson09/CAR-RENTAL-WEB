'use client';

import { Switch } from '@/components/ui/switch';

interface ZDSDiscountToggleProps {
  withInZDS: boolean;
  onWithInZDSChange: (value: boolean) => void;
}

export const ZDSDiscountToggle = ({ withInZDS, onWithInZDSChange }: ZDSDiscountToggleProps) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Within Zamboanga Del Sur
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Are you traveling within Zamboanga Del Sur province?
          </p>
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            {withInZDS
              ? '✅ ZDS discount will be applied to your booking!'
              : '💡 Toggle on to get ₱100 (regular cars) or ₱200 (promo cars) off your base price'}
          </p>
        </div>
        <div className="ml-4">
          <Switch
            checked={withInZDS}
            onCheckedChange={onWithInZDSChange}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
      </div>
    </div>
  );
};
