import React from 'react';
import { IoMdTrendingDown, IoMdTrendingUp, IoIosArrowRoundForward } from 'react-icons/io';
import { PiHeart, PiChartLine, PiTrendUp } from 'react-icons/pi';

const TRENDING_ICONS = {
  'Trending Up': { 
    icon: <IoMdTrendingUp className="text-green-600" />, 
    class: 'text-green-600',
    bgClass: 'bg-green-100',
    iconBg: 'bg-green-500'
  },
  'Trending Down': { 
    icon: <IoMdTrendingDown className="text-red-500" />, 
    class: 'text-red-500',
    bgClass: 'bg-red-100',
    iconBg: 'bg-red-500'
  },
  Stable: { 
    icon: <IoIosArrowRoundForward className="text-gray-600" />, 
    class: 'text-gray-600',
    bgClass: 'bg-gray-100',
    iconBg: 'bg-gray-500'
  },
};

const WellnessStats = ({ wellnessScore, average, latestTrend }) => {
  const [icon, averageNumber] = average?.split(' ') || [];
  const trendData = TRENDING_ICONS[latestTrend] || TRENDING_ICONS.Stable;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Wellness Score */}
      <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="absolute top-4 right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
          <PiHeart className="text-white text-xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            {/* <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <PiHeart className="text-white text-lg" />
            </div> */}
            <h3 className="text-lg font-semibold text-gray-700">Wellness Score</h3>
          </div>
          <div className="text-4xl font-bold text-green-700 mb-2">{wellnessScore || 'N/A'}</div>
          <p className="text-sm text-gray-600">Your current wellness level</p>
        </div>
      </div>

      {/* Card 2: Average */}
      <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="absolute top-4 right-4 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
          <PiChartLine className="text-white text-xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            {/* <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <PiChartLine className="text-white text-lg" />
            </div> */}
            <h3 className="text-lg font-semibold text-gray-700">Average</h3>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{icon}</span>
            <span className="text-4xl font-bold text-emerald-700">{averageNumber || 'N/A'}</span>
          </div>
          <p className="text-sm text-gray-600">Your average wellness score</p>
        </div>
      </div>

      {/* Card 3: Latest Trend */}
      <div className="group relative bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 shadow-lg border border-teal-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className={`absolute top-4 right-4 w-12 h-12 ${trendData.iconBg} rounded-full flex items-center justify-center opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
          <PiTrendUp className="text-white text-xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            {/* <div className={`w-10 h-10 ${trendData.iconBg} rounded-full flex items-center justify-center`}>
              <PiTrendUp className="text-white text-lg" />
            </div> */}
            <h3 className="text-lg font-semibold text-gray-700">Latest Trend</h3>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 ${trendData.bgClass} rounded-full flex items-center justify-center`}>
              {trendData.icon}
            </div>
            <span className={`text-2xl font-bold ${trendData.class}`}>{latestTrend || 'Stable'}</span>
          </div>
          <p className="text-sm text-gray-600">Your wellness direction</p>
        </div>
      </div>
    </div>
  );
};

export default WellnessStats;
