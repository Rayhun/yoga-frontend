import React from 'react';
import { IoMdTrendingDown, IoMdTrendingUp, IoIosArrowRoundForward } from 'react-icons/io';

const TRENDING_ICONS = {
  'Trending Up': { icon: <IoMdTrendingUp className="text-green-500" />, class: 'text-green-500' },
  'Trending Down': { icon: <IoMdTrendingDown className="text-orange-500" />, class: 'text-orange-500' },
  Stable: { icon: <IoIosArrowRoundForward className="text-gray-500" />, class: 'text-gray-500' },
};

const WellnessStats = ({ wellnessScore, average, latestTrend }) => {
  const [icon, averageNumber] = average?.split(' ') || [];
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
            TRENDING_ICONS[latestTrend]?.class || 'text-gray-500'
          }`}
        >
          {/* {TRENDING_ICONS[latestTrend].icon || <span className="text-gray-500">N/A</span>} */}
          <span>{latestTrend}</span>
        </div>
      </div>
    </div>
  );
};

export default WellnessStats;
