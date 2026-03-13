'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBusinessSubscription, 
  updateBusinessSubscription,
  getBusinessSubscriptionHistory 
} from '@/services/private/business/subscription';
import { toast } from 'react-toastify';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import SubscriptionDetails from './SubscriptionDetails';
import SubscriptionHistory from './SubscriptionHistory';
import { 
  FiCreditCard, 
  FiClock,
  FiUsers,
  FiAlertCircle
} from 'react-icons/fi';

const TABS = {
  DETAILS: 'details',
  HISTORY: 'history',
};

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState(TABS.DETAILS);
  const queryClient = useQueryClient();

  // Fetch current subscription
  const { 
    data: subscriptionResponse, 
    isLoading: isLoadingSubscription,
    error: subscriptionError 
  } = useQuery({
    queryKey: [queryKeys.businessSubscription],
    queryFn: getBusinessSubscription,
  });

  // Fetch subscription history
  const { 
    data: historyResponse, 
    isLoading: isLoadingHistory 
  } = useQuery({
    queryKey: [queryKeys.businessSubscriptionHistory],
    queryFn: getBusinessSubscriptionHistory,
  });

  // Update subscription mutation
  const { mutateAsync: updateSubscriptionMutation } = useMutation({
    mutationFn: updateBusinessSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.businessSubscription]);
      queryClient.invalidateQueries([queryKeys.businessSubscriptionHistory]);
      toast.success('Employee limit updated successfully');
    },
    onError: (error) => {
      toastApiError(error);
    },
  });

  const subscription = subscriptionResponse?.data?.data;
  const subscriptionHistory = historyResponse?.data?.data || [];

  const tabs = [
    {
      id: TABS.DETAILS,
      name: 'Subscription Details',
      icon: FiCreditCard,
      description: 'Manage your subscription and employee limits',
    },
    {
      id: TABS.HISTORY,
      name: 'Subscription History',
      icon: FiClock,
      description: 'View your subscription history',
    },
  ];

  const handleUpdateEmployeeLimit = async (newLimit) => {
    await updateSubscriptionMutation({ employee_limit: newLimit });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.DETAILS:
        return (
          <SubscriptionDetails 
            subscription={subscription}
            onUpdateEmployeeLimit={handleUpdateEmployeeLimit}
            isLoading={isLoadingSubscription}
          />
        );
      case TABS.HISTORY:
        return (
          <SubscriptionHistory 
            history={subscriptionHistory}
            isLoading={isLoadingHistory}
          />
        );
      default:
        return null;
    }
  };

  if (subscriptionError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <FiAlertCircle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Subscription</h3>
            <p className="text-red-600 mt-1">
              {subscriptionError.message || 'Unable to load subscription data'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
            <FiCreditCard className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Subscription Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your business subscription and employee limits
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
  );
};

export default SubscriptionManagement;
