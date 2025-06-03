import React from 'react';
import { IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';

const WellnessStats = ({ wellnessScore, average, latestTrend }) => {
  const [icon, averageNumber] = average.split(' ');
  return (
    <div className="flex flex-col gap-4 rounded-lg sm:flex-row sm:justify-between sm:items-stretch">
      {/* Card 1: Wellness Score */}
      <div className="flex-1 bg-white bg-gray-50 rounded-md p-4 shadow-sm space-y-6">
        <p className="text-lg font-semibold text-gray-500 mb-1">Your wellness score</p>
        <p className="text-4xl font-semibold text-green-700">{wellnessScore}</p>
      </div>

      {/* Card 2: Average */}
      <div className="flex-1 bg-white bg-gray-50 rounded-md p-4 shadow-sm space-y-6">
        <p className="text-lg font-semibold text-gray-500 mb-1">Average</p>
        <div className="flex items-center space-x-2 text-2xl">
          <span>{icon}</span>
          <span className="font-medium text-black">{averageNumber}</span>
        </div>
      </div>

      {/* Card 3: Latest Trend */}
      <div className="flex-1 bg-white bg-gray-50 rounded-md p-4 shadow-sm space-y-6">
        <p className="text-lg font-semibold text-gray-500 mb-1">Latest trend</p>
        <div
          className={`flex items-center space-x-2 text-2xl font-semibold ${
            latestTrend === 'Declining' ? 'text-orange-500' : 'text-green-500'
          }`}
        >
          {latestTrend === 'Declining' ? <IoMdTrendingDown /> : <IoMdTrendingUp />}
          <span>{latestTrend}</span>
        </div>
      </div>
    </div>
  );
};

export default WellnessStats;
