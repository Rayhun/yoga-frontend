'use client';
import React from 'react';
import { 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiClock,
  FiXCircle
} from 'react-icons/fi';
import useAuthContext from '@/hooks/useAuthContext';

const SubscriptionStatus = () => {
  const { user } = useAuthContext();

  // Mock subscription data - in real app, this would come from API
  const getSubscriptionStatus = () => {
    // This would be fetched from the backend
    return {
      status: 'active', // active, expired, pending
      plan: 'Business Pro',
      expiresAt: '2024-12-31',
      employeesCount: 5,
      employeesLimit: 50,
    };
  };

  const subscription = getSubscriptionStatus();

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          icon: FiCheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          title: 'Active Subscription',
          description: 'Your business subscription is active and all employees have access.',
        };
      case 'expired':
        return {
          icon: FiXCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          title: 'Subscription Expired',
          description: 'Your business subscription has expired. Employees cannot access the platform.',
        };
      case 'pending':
        return {
          icon: FiClock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          title: 'Subscription Pending',
          description: 'Your business subscription is being processed.',
        };
      default:
        return {
          icon: FiAlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          title: 'Unknown Status',
          description: 'Unable to determine subscription status.',
        };
    }
  };

  const statusConfig = getStatusConfig(subscription.status);
  const Icon = statusConfig.icon;

  if (!user?.isBusinessOwner && !user?.isEmployee) {
    return null;
  }

  return (
    <div className={`rounded-lg border ${statusConfig.borderColor} ${statusConfig.bgColor} p-4 mb-6`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${statusConfig.color}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {statusConfig.description}
          </p>
          
          {user?.isBusinessOwner && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium text-gray-900">{subscription.plan}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Employees:</span>
                <span className="font-medium text-gray-900">
                  {subscription.employeesCount} / {subscription.employeesLimit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expires:</span>
                <span className="font-medium text-gray-900">
                  {new Date(subscription.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
          
          {user?.isEmployee && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                You have access through your business account. Contact your administrator for any issues.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
