'use client';
import React from 'react';
import { 
  FiUsers, 
  FiCheckCircle, 
  FiClock,
  FiAlertTriangle,
  FiHome
} from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';
import useAuthContext from '@/hooks/useAuthContext';
import { useQuery } from '@tanstack/react-query';
import { getBusinessSubscription } from '@/services/private/business/subscription';
import queryKeys from '@/utils/query-keys';

const BusinessOverview = ({ employeesCount }) => {
  const { user } = useAuthContext();
  const userProfile = user?.profile;

  // Fetch real subscription data
  const { 
    data: subscriptionResponse, 
    isLoading: isLoadingSubscription 
  } = useQuery({
    queryKey: [queryKeys.businessSubscription],
    queryFn: getBusinessSubscription,
  });

  const subscriptionData = subscriptionResponse?.data?.data;

  const stats = [
    {
      name: 'Total Employees',
      value: employeesCount,
      icon: FiUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Subscription',
      value: subscriptionData?.status || 'N/A',
      icon: FiCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Plan',
      value: subscriptionData?.title || 'N/A',
      icon: FaBuilding,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Expires',
      value: subscriptionData?.expires 
        ? new Date(subscriptionData.expires).toLocaleDateString()
        : 'N/A',
      icon: FiClock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const getSubscriptionStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-white/20 p-6 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Business Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Business Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <FiUsers className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Business Information
            </h3>
          </div>
          <dl className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Business Owner
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {userProfile?.first_name} {userProfile?.last_name}
              </dd>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Email
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {user?.email}
              </dd>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Profile Type
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {userProfile?.profile_type}
              </dd>
            </div>
            <div className="flex justify-between items-center py-3">
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Account Created
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {userProfile?.created_at 
                  ? new Date(userProfile.created_at).toLocaleDateString()
                  : 'N/A'
                }
              </dd>
            </div>
          </dl>
        </div>

        {/* Subscription Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <FiCheckCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Subscription Details
            </h3>
          </div>
          <dl className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Status
              </dt>
              <dd className="text-sm">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getSubscriptionStatusColor(subscriptionData?.status || 'inactive')}`}>
                  {(subscriptionData?.status || 'inactive').charAt(0).toUpperCase() + (subscriptionData?.status || 'inactive').slice(1)}
                </span>
              </dd>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Plan
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {subscriptionData?.title || 'N/A'}
              </dd>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Employee Limit
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                  {employeesCount} / {subscriptionData?.employee_limit || 'N/A'}
                </span>
              </dd>
            </div>
            <div className="flex justify-between items-center py-3">
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Expires
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {subscriptionData?.expires 
                  ? new Date(subscriptionData.expires).toLocaleDateString()
                  : 'N/A'
                }
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
            <FiAlertTriangle className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="group flex items-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div className="p-3 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FiUsers className="h-6 w-6 text-white" />
            </div>
            <div className="text-left ml-4">
              <p className="font-bold text-gray-900 group-hover:text-blue-700">Add Employee</p>
              <p className="text-sm text-gray-600 group-hover:text-blue-600">Invite new team member</p>
            </div>
          </button>
          
          <button className="group flex items-center p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div className="p-3 bg-green-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FiCheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-left ml-4">
              <p className="font-bold text-gray-900 group-hover:text-green-700">View Reports</p>
              <p className="text-sm text-gray-600 group-hover:text-green-600">Check usage analytics</p>
            </div>
          </button>
          
          <button className="group flex items-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div className="p-3 bg-orange-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FiAlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="text-left ml-4">
              <p className="font-bold text-gray-900 group-hover:text-orange-700">Manage Subscription</p>
              <p className="text-sm text-gray-600 group-hover:text-orange-600">Update billing settings</p>
            </div>
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default BusinessOverview;
