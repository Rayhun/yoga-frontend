'use client';
import React, { useState } from 'react';
import { FiCalendar, FiActivity, FiCheckCircle } from 'react-icons/fi';
import Tracker from '@/components/customer/checkin/tracker';
import DailyTracker from '@/components/customer/checkin/tracker/DailyTracker';

const TABS = {
  TRACKER: 'tracker',
  DAILY_CHECKIN: 'daily_checkin',
};

const CheckInTabs = () => {
  const [activeTab, setActiveTab] = useState(TABS.TRACKER);

  const tabs = [
    {
      id: TABS.TRACKER,
      name: 'Tracker',
      icon: FiCalendar,
      description: 'Track your cycle and periods',
    },
    {
      id: TABS.DAILY_CHECKIN,
      name: 'Daily Check-in',
      icon: FiActivity,
      description: 'Daily wellness and body signals',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.TRACKER:
        return <Tracker />;
      case TABS.DAILY_CHECKIN:
        return <DailyTracker />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
            <FiCheckCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Wellness Tracking
            </h1>
            <p className="text-gray-600 mt-1">
              Track your wellness journey with comprehensive tools
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="border-b border-gray-200/50">
          <nav className="flex space-x-8 px-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-3 py-6 px-4 border-b-3 font-semibold text-sm transition-all duration-300 relative group
                    ${activeTab === tab.id
                      ? 'border-green-500 text-green-600 bg-green-50/50'
                      : 'border-transparent text-gray-600 hover:text-green-600 hover:border-green-300 hover:bg-green-50/30'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <div className="text-left">
                    <span className="block">{tab.name}</span>
                    <span className={`text-xs ${activeTab === tab.id ? 'text-green-500' : 'text-gray-400 group-hover:text-green-400'}`}>
                      {tab.description}
                    </span>
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-96 animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CheckInTabs;
