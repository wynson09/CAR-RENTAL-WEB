'use client';

interface TripOverviewProps {
  destination: string;
  totalDuration: number;
  driveOption: 'self-drive' | 'with-driver';
}

export const TripOverview = ({ destination, totalDuration, driveOption }: TripOverviewProps) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
        🗺️ Trip Overview
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <label className="text-blue-600 dark:text-blue-300 font-medium">Destination</label>
          <p className="mt-1 font-semibold text-blue-800 dark:text-blue-100">{destination}</p>
        </div>
        <div>
          <label className="text-blue-600 dark:text-blue-300 font-medium">Duration</label>
          <p className="mt-1 font-semibold text-blue-800 dark:text-blue-100">
            {totalDuration} day{totalDuration !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <label className="text-blue-600 dark:text-blue-300 font-medium">Service Type</label>
          <p className="mt-1 font-semibold text-blue-800 dark:text-blue-100">
            {driveOption === 'self-drive' ? 'Self Drive' : 'With Driver'}
          </p>
        </div>
      </div>
    </div>
  );
};
