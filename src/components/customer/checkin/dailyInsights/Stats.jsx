import React from 'react';
import { IoMdTrendingUp } from "react-icons/io";


const WellnessStats = () => {
  return (
    <div className="flex flex-col gap-4 rounded-lg sm:flex-row sm:justify-between sm:items-stretch">
      {/* Card 1: Wellness Score */}
      <div className="flex-1 bg-white bg-gray-50 rounded-md p-4 shadow-sm space-y-6">
        <p className="text-lg font-semibold text-gray-500 mb-1">Your wellness score</p>
        <p className="text-4xl font-semibold text-green-700">83</p>
      </div>

      {/* Card 2: Average */}
      <div className="flex-1 bg-white bg-gray-50 rounded-md p-4 shadow-sm space-y-6">
        <p className="text-lg font-semibold text-gray-500 mb-1">Average</p>
        <div className="flex items-center space-x-2 text-2xl">
          <span>😟</span>
          <span className="font-medium text-black">3.4/5</span>
        </div>
      </div>

      {/* Card 3: Latest Trend */}
      <div className="flex-1 bg-white bg-gray-50 rounded-md p-4 shadow-sm space-y-6">
        <p className="text-lg font-semibold text-gray-500 mb-1">Latest trend</p>
        <div className="flex items-center space-x-2 text-2xl font-semibold text-green-500">
          <IoMdTrendingUp />
          <span>Improving</span>
        </div>
      </div>
    </div>
  );
};

export default WellnessStats;
