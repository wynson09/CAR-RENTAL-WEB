'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Car, PricingResult, DiscountItem } from './car-card';
import { format, differenceInCalendarDays } from 'date-fns';

interface QuotationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car;
  pickupDate?: Date;
  returnDate?: Date;
  driveOption: 'self-drive' | 'with-driver';
  pricing: PricingResult;
}

export const QuotationDialog = ({
  isOpen,
  onClose,
  car,
  pickupDate,
  returnDate,
  driveOption,
  pricing,
}: QuotationDialogProps) => {
  if (!pickupDate || !returnDate) {
    return null;
  }

  const dayDuration = Math.max(1, differenceInCalendarDays(returnDate, pickupDate));

  // Calculate pricing details
  const carBasePrice = pricing.originalPrice;
  const driverFeePerDay = driveOption === 'with-driver' ? 750 : 0;
  const totalDriverFee = driverFeePerDay * dayDuration;
  const totalCarPrice = pricing.discountedPrice * dayDuration;
  const totalOriginalPrice = (carBasePrice + driverFeePerDay) * dayDuration;
  const totalSavings = pricing.totalSavings * dayDuration;

  const quotationNumber = `QT-${Date.now().toString().slice(-6)}`;
  const currentDate = new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] max-w-[1200px] max-h-[90vh] overflow-y-auto p-0 gap-0"
        style={{ width: '95vw', maxWidth: '1200px' }}
      >
        <div className="p-8">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                  Rental Quotation
                </DialogTitle>
                <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
                  Quote #{quotationNumber} • Generated on {format(currentDate, 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-base font-bold">
                  {driveOption === 'with-driver' ? 'WITH DRIVER' : 'SELF DRIVE'}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-8">
            {/* Vehicle Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 border border-blue-100 dark:border-gray-700">
              <div className="flex items-start gap-8">
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    {car.name.replace('🔥 ', '')}
                  </h3>
                  <div className="flex flex-wrap flex-col sm:flex-row gap-6 text-base">
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-700 p-4 rounded-lg border">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {car.passengers}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Passengers</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-700 p-4 rounded-lg border">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                        />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {car.bags}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Bags</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-700 p-4 rounded-lg border">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {car.transmission}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Transmission</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-700 p-4 rounded-lg border">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {car.category}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Category</div>
                      </div>
                    </div>
                  </div>
                  {car.isPromo && (
                    <div className="mt-3 inline-flex items-center gap-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs font-bold">
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      PROMOTIONAL VEHICLE
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rental Period */}
            {pickupDate && returnDate && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                <h4 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Rental Period
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl border shadow-sm">
                    <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
                      Pickup Date
                    </div>
                    <div className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                      {format(pickupDate, 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {format(pickupDate, 'EEEE')}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl border shadow-sm">
                    <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
                      Return Date
                    </div>
                    <div className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                      {format(returnDate, 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {format(returnDate, 'EEEE')}
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 md:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-sm">
                    <div className="text-sm sm:text-base text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">
                      Total Duration
                    </div>
                    <div className="font-bold text-2xl sm:text-3xl text-blue-700 dark:text-blue-300">
                      {dayDuration}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Day{dayDuration !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h4 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <svg
                  className="w-8 h-8 text-green-600"
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
                Pricing Breakdown
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Column - Itemized Costs */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 border-b pb-2">
                    Cost Breakdown
                  </h5>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Car Rental ({dayDuration} day{dayDuration !== 1 ? 's' : ''})
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₱{totalCarPrice.toLocaleString()}
                      </span>
                    </div>

                    {driveOption === 'with-driver' && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Driver Fee ({dayDuration} day{dayDuration !== 1 ? 's' : ''})
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₱{totalDriverFee.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Subtotal
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ₱{(totalCarPrice + totalDriverFee).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Savings & Total */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 border-b pb-2">
                    Savings & Total
                  </h5>

                  <div className="space-y-3">
                    {/* Applied Discounts */}
                    {pricing.discountBreakdown.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <h6 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                          Applied Discounts:
                        </h6>
                        {pricing.discountBreakdown.map((discount: DiscountItem, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-green-700 dark:text-green-300">
                              {discount.name}
                            </span>
                            <span className="font-medium text-green-800 dark:text-green-200">
                              -₱{(discount.amount * dayDuration).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {totalSavings > 0 && (
                      <div className="flex justify-between items-center py-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 rounded-lg">
                        <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                          Total Savings
                        </span>
                        <span className="font-bold text-yellow-900 dark:text-yellow-100">
                          ₱{totalSavings.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="border-t pt-3 mt-4">
                      <div className="flex justify-between items-center py-3 bg-blue-50 dark:bg-blue-900/20 px-4 rounded-lg">
                        <span className="text-xl font-bold text-blue-800 dark:text-blue-200">
                          Final Total
                        </span>
                        <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          ₱{(totalCarPrice + totalDriverFee).toLocaleString()}
                        </span>
                      </div>
                      {totalSavings > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                          You save ₱{totalSavings.toLocaleString()} (
                          {((totalSavings / totalOriginalPrice) * 100).toFixed(1)}%) with this
                          booking!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 sm:p-6 border border-yellow-200 dark:border-yellow-800">
              <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Important Notes
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• This quotation is valid for 24 hours from generation date</li>
                <li>• Final pricing may vary based on terms and conditions</li>
                <li>• Additional charges may apply for late returns or damages</li>
                {driveOption === 'with-driver' && (
                  <li>
                    • Driver fee includes 8 hours of service per day (additional hours charged
                    separately)
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} className="flex-1 py-3">
              Close
            </Button>
            <Button className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              Proceed to Booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
