'use client';
import React, { useState } from 'react';
import { MONTHLY_GOAL_TYPES } from '@/utils/constants';
import GoalCategories from './Categories';
import MonthlyGoalForm from './Form';
import { PiTarget } from 'react-icons/pi';
import { PiLightningLight } from 'react-icons/pi';
import { PiChartLine } from 'react-icons/pi';

const Section = ({ children, className = "" }) => (
  <div className={`bg-white portal-section rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
    <div>{children}</div>
  </div>
);

const MonthlyGoal = () => {
  const [selectedConcern, setSelectedConcern] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);

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

      {/* Process Flow Information */}
      <div className="bg-white portal-section rounded-2xl shadow-lg border border-gray-100 mb-6 relative">
        {/* Info Button - Top Right */}
        <div className="absolute top-4 right-4">
          <button
            type="button"
            aria-label="Insights info"
            onClick={() => setInfoOpen((prev) => !prev)}
            className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </button>
        </div>
        {infoOpen && (
          <div className="absolute top-12 right-4 mt-2 w-64 bg-white border border-emerald-100 rounded-xl shadow-xl p-3 z-20">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                i
              </div>
              <div className="text-sm font-semibold text-gray-800 leading-snug">
                Track 5 days to see your insights ✨
              </div>
              <button
                type="button"
                aria-label="Close insight info"
                onClick={() => setInfoOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-center gap-8 md:gap-12">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center text-2xl font-bold border-4 border-green-500 shadow-lg">
              1
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-800 font-semibold text-sm md:text-base">Choose</p>
              <p className="text-gray-800 font-semibold text-sm md:text-base">goal</p>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="hidden md:block pb-13">
            <svg className="w-12 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center text-2xl font-bold border-4 border-green-500 shadow-lg">
              2
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-800 font-semibold text-sm md:text-base">Choose</p>
              <p className="text-gray-800 font-semibold text-sm md:text-base">Habit</p>
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="hidden md:block pb-13">
            <svg className="w-12 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black text-2xl font-bold border-4 border-green-500 shadow-lg">
              3
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-800 font-semibold text-sm md:text-base">Track</p>
              <p className="text-gray-800 font-semibold text-sm md:text-base">Habit</p>
            </div>
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
              Choose Your Goal
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
              Set Your Habit
            </h2>
            <p className="text-gray-600">Define your specific goal and how you&apos;ll measure success.</p>
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
