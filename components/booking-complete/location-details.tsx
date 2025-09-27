'use client';

import { Calendar, Clock, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface LocationDetailsProps {
  pickUpAddress: string;
  pickUpDate: string;
  pickUpTime: string;
  returnAddress: string;
  returnDate: string;
  returnTime: string;
  pickupPagadianDetails?: string;
  returnPagadianDetails?: string;
}

const getAddressLabel = (address: string, pagadianDetails?: string) => {
  const addressLabels: Record<string, string> = {
    'nacs-garage': 'NACS Car Rental Garage',
    'nacs-garage-return': 'NACS Car Rental Garage',
    'pagadian-airport': 'Pagadian Airport',
    'pagadian-area': 'Pagadian City Area',
  };

  const baseLabel = addressLabels[address] || address;

  if (address === 'pagadian-area' && pagadianDetails?.trim()) {
    return `${baseLabel} - ${pagadianDetails}`;
  }

  return baseLabel;
};

const getLocationIcon = (address: string) => {
  switch (address) {
    case 'nacs-garage':
    case 'nacs-garage-return':
      return '🏢';
    case 'pagadian-airport':
      return '✈️';
    case 'pagadian-area':
      return '🏙️';
    default:
      return '📍';
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return format(date, 'PPP');
  } catch {
    return dateString;
  }
};

export const LocationDetails = ({
  pickUpAddress,
  pickUpDate,
  pickUpTime,
  returnAddress,
  returnDate,
  returnTime,
  pickupPagadianDetails,
  returnPagadianDetails,
}: LocationDetailsProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        📍 Pickup & Return Schedule
      </h4>

      {/* Pickup */}
      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h5 className="font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
          <span className="text-lg">{getLocationIcon(pickUpAddress)}</span>
          Pickup Location & Time
        </h5>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-100">
                {getAddressLabel(pickUpAddress, pickupPagadianDetails)}
              </p>
              {pickUpAddress === 'nacs-garage' && (
                <p className="text-green-600 dark:text-green-300 text-xs mt-1">
                  🏢 Self pickup at our main garage facility
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <span className="flex items-center gap-1 text-green-700 dark:text-green-300">
              <Calendar className="h-3 w-3" />
              <span className="font-medium">{formatDate(pickUpDate)}</span>
            </span>
            <span className="flex items-center gap-1 text-green-700 dark:text-green-300">
              <Clock className="h-3 w-3" />
              <span className="font-medium">{pickUpTime}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Return */}
      <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
        <h5 className="font-medium text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
          <span className="text-lg">{getLocationIcon(returnAddress)}</span>
          Return Location & Time
        </h5>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-100">
                {getAddressLabel(returnAddress, returnPagadianDetails)}
              </p>
              {returnAddress === 'nacs-garage-return' && (
                <p className="text-orange-600 dark:text-orange-300 text-xs mt-1">
                  🏢 Return directly to our main garage facility
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <span className="flex items-center gap-1 text-orange-700 dark:text-orange-300">
              <Calendar className="h-3 w-3" />
              <span className="font-medium">{formatDate(returnDate)}</span>
            </span>
            <span className="flex items-center gap-1 text-orange-700 dark:text-orange-300">
              <Clock className="h-3 w-3" />
              <span className="font-medium">{returnTime}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
