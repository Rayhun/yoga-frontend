'use client';
import React, { useState } from 'react';
import { MONTHLY_GOAL_TYPES } from '@/utils/constants';
import GoalCategories from './Categories';
import MonthlyGoalForm from './Form';
import { PiTarget } from 'react-icons/pi';
import { PiLightningLight } from 'react-icons/pi';
import { PiChartLine } from 'react-icons/pi';

const Section = ({ children, className = "" }) => (
  <div className={`bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
    <div>{children}</div>
  </div>
);

const MonthlyGoal = () => {
  const [selectedConcern, setSelectedConcern] = useState("");

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-8 px-6 rounded-2xl shadow-2xl mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center text-xl gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <PiTarget size={24} />
            </div>
            <div>
              <h1 className="font-bold text-2xl">Set Your Monthly Goal</h1>
              <p className="text-green-100 text-sm">Choose one focus area to track progress and see meaningful results</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-yellow-300 text-lg font-bold">
              <PiLightningLight size={24} className="animate-pulse" />
              <span>Focus & Achieve</span>
            </div>
            <p className="text-green-100 text-sm">One goal at a time</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-8">
        <Section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">🎯</span>
              </div>
              Choose Your Focus Area
            </h2>
            <p className="text-gray-600">Select one primary concern to focus on this month for maximum impact.</p>
          </div>
          <GoalCategories selected={selectedConcern} setSelected={setSelectedConcern} />
        </Section>
        
        <Section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-sm">📝</span>
              </div>
              Set Your Goal Details
            </h2>
            <p className="text-gray-600">Define your specific goal and how you'll measure success.</p>
          </div>
          <MonthlyGoalForm selectedConcern={selectedConcern} />
        </Section>
      </div>

      {/* Additional Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">🎯</span>
            </div>
            <h3 className="font-bold text-gray-800">Focus on One Goal</h3>
          </div>
          <p className="text-gray-600 text-sm">Concentrating on a single focus area increases your chances of success and meaningful progress.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 text-lg">📊</span>
            </div>
            <h3 className="font-bold text-gray-800">Track Progress</h3>
          </div>
          <p className="text-gray-600 text-sm">Monitor your daily progress and celebrate small wins along your wellness journey.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 text-lg">🌟</span>
            </div>
            <h3 className="font-bold text-gray-800">Build Habits</h3>
          </div>
          <p className="text-gray-600 text-sm">Consistent daily actions lead to lasting change and improved well-being over time.</p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyGoal;
