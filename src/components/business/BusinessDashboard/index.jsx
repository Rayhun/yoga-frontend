'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEmployeesList } from '@/services/private/user/employees';
import useAuthContext from '@/hooks/useAuthContext';
import queryKeys from '@/utils/query-keys';
import EmployeeManagement from '../EmployeeManagement';
import BusinessOverview from './BusinessOverview';
import SubscriptionManagement from '../SubscriptionManagement';
import CheckInTabs from '../CheckInTabs';
import { 
  FiUsers, 
  FiSettings,
  FiHome,
  FiCreditCard,
  FiCheckCircle
} from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';
import { TbChartLine } from 'react-icons/tb';

const TABS = {
  OVERVIEW: 'overview',
  EMPLOYEES: 'employees',
  CHECKIN: 'checkin',
  SUBSCRIPTION: 'subscription',
  SETTINGS: 'settings',
};

const BusinessDashboard = () => {
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const { user } = useAuthContext();

  // Fetch employees count for overview
  const { data: employeesResponse } = useQuery({
    queryKey: [queryKeys.employees],
    queryFn: getEmployeesList,
  });

  const employeesCount = employeesResponse?.data?.data?.length || 0;

  const tabs = [
    {
      id: TABS.OVERVIEW,
      name: 'Overview',
      icon: TbChartLine,
      description: 'Business insights and statistics',
    },
    {
      id: TABS.EMPLOYEES,
      name: 'Employees',
      icon: FiUsers,
      description: 'Manage your team members',
    },
    {
      id: TABS.CHECKIN,
      name: 'Check-in',
      icon: FiCheckCircle,
      description: 'Wellness tracking and daily check-ins',
    },
    {
      id: TABS.SUBSCRIPTION,
      name: 'Subscription',
      icon: FiCreditCard,
      description: 'Manage subscription and employee limits',
    },
    // {
    //   id: TABS.SETTINGS,
    //   name: 'Settings',
    //   icon: FiSettings,
    //   description: 'Business account settings',
    // },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.OVERVIEW:
        return <BusinessOverview employeesCount={employeesCount} />;
      case TABS.EMPLOYEES:
        return <EmployeeManagement />;
      case TABS.CHECKIN:
        return <CheckInTabs />;
      case TABS.SUBSCRIPTION:
        return <SubscriptionManagement />;
      case TABS.SETTINGS:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Business Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Business settings and configuration options will be available here.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FaBuilding className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Business Dashboard
              </h1>
              <p className="text-green-100 text-lg">
                Welcome back, {user?.profile?.first_name}! Manage your business account.
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
        </div>

        {/* Tab Content */}
        <div className="min-h-96 animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
