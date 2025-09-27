'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DriveOptionSelectorProps {
  driveOption: 'self-drive' | 'with-driver';
  onDriveOptionChange: (option: 'self-drive' | 'with-driver') => void;
}

export const DriveOptionSelector = ({
  driveOption,
  onDriveOptionChange,
}: DriveOptionSelectorProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
        <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Choose Your Driving Experience
        </Label>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Self Drive Option */}
        <div
          className={cn(
            'relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
            driveOption === 'self-drive'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 ring-2 ring-blue-200 dark:ring-blue-800'
              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300'
          )}
          onClick={() => onDriveOptionChange('self-drive')}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-5 h-5 min-w-[20px] min-h-[20px] rounded-full border-2 flex items-center justify-center flex-shrink-0',
                driveOption === 'self-drive'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            >
              {driveOption === 'self-drive' && (
                <div className="w-2 h-2 min-w-[8px] min-h-[8px] bg-white rounded-full"></div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-4c0-5.523 4.477-10 10-10s10 4.477 10 10a4 4 0 01-4 4z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Self Drive</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Drive the vehicle yourself with complete freedom
              </p>
            </div>
          </div>
        </div>

        {/* With Driver Option */}
        <div
          className={cn(
            'relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
            driveOption === 'with-driver'
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20 ring-2 ring-green-200 dark:ring-green-800'
              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-green-300'
          )}
          onClick={() => onDriveOptionChange('with-driver')}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-5 h-5 min-w-[20px] min-h-[20px] rounded-full border-2 flex items-center justify-center flex-shrink-0',
                driveOption === 'with-driver'
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            >
              {driveOption === 'with-driver' && (
                <div className="w-2 h-2 min-w-[8px] min-h-[8px] bg-white rounded-full"></div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
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
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">With Driver</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Professional driver included (+₱750/day)
              </p>
            </div>
          </div>
          {driveOption === 'with-driver' && (
            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-xs font-medium">Licensed & Experienced Driver</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
