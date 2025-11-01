'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCustomerSubscriptionStatus,
  cancelCustomerSubscription,
  reactivateCustomerSubscription
} from '@/services/private/customer/subscription';
import { toast } from 'react-toastify';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { 
  FiCreditCard, 
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiInfo
} from 'react-icons/fi';
import Spinner from '@/components/common/loader/Spinner';

const CustomerSubscriptionList = () => {
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);

  // Fetch subscription status
  const { 
    data: subscriptionResponse, 
    isLoading: isLoadingSubscription,
    error: subscriptionError 
  } = useQuery({
    queryKey: ['customerSubscriptionStatus'],
    queryFn: getCustomerSubscriptionStatus,
  });

  // Subscription history is no longer needed - removed

  // Cancel subscription mutation
  const { mutateAsync: cancelSubscription, isPending: isCancelling } = useMutation({
    mutationFn: cancelCustomerSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries(['customerSubscriptionStatus']);
      toast.success('Subscription cancelled successfully. Your subscription will remain active until the end of the current billing period.');
    },
    onError: (error) => {
      toastApiError(error);
    },
  });

  // Reactivate subscription mutation
  const { mutateAsync: reactivateSubscription, isPending: isReactivating } = useMutation({
    mutationFn: reactivateCustomerSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries(['customerSubscriptionStatus']);
      toast.success('Subscription reactivated successfully. Your subscription will continue to auto-renew.');
    },
    onError: (error) => {
      toastApiError(error);
    },
  });

  const subscription = subscriptionResponse?.data?.data;
  const hasSubscription = subscription?.has_subscription;

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setShowCancelModal(false);
    try {
      await cancelSubscription();
    } catch (error) {
      // Error is handled by onError callback
    }
  };

  const handleReactivate = () => {
    setShowReactivateModal(true);
  };

  const confirmReactivate = async () => {
    setShowReactivateModal(false);
    try {
      await reactivateSubscription();
    } catch (error) {
      // Error is handled by onError callback
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Close modals on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowCancelModal(false);
        setShowReactivateModal(false);
      }
    };

    if (showCancelModal || showReactivateModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showCancelModal, showReactivateModal]);

  if (isLoadingSubscription) {
    return (
      <div className="max-w-7xl mx-auto p-6 min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Membership Details</h1>
        <p className="text-gray-600 dark:text-gray-400 text-base">Manage your subscription and billing information</p>
      </div>

      {subscriptionError ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-red-200 dark:border-red-800 p-6 mb-8">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error Loading Subscription</h3>
              <p className="text-red-600 dark:text-red-400 mt-1">
                {subscriptionError?.response?.data?.message || 'Unable to load subscription data'}
              </p>
            </div>
          </div>
        </div>
      ) : !hasSubscription ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <FiCreditCard className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Active Membership</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            You don&apos;t have an active subscription yet.
          </p>
          <button
            onClick={() => window.location.href = '/subscription'}
            className="bg-primary hover:bg-opacity-90 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Choose a Plan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Membership Details Card - Clean Design */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              {/* Member Since Badge */}
              {subscription?.start_at && (
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-red-600 rounded-lg px-4 py-2.5 inline-block">
                    <p className="text-white font-semibold text-sm">
                      Member since {new Date(subscription.start_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}

              {/* Plan Name & Status */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {subscription?.plan_title || 'Subscription Plan'}
                  </h2>
                  {subscription?.is_active && !subscription?.is_cancelled && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Active</span>
                    </div>
                  )}
                  {subscription?.is_cancelled && subscription?.is_active && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-200">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Cancelled</span>
                    </div>
                  )}
                </div>
                {subscription?.is_cancelled && subscription?.is_active ? (
                  <p className="text-sm text-orange-600 font-medium">
                    Membership ends {formatDate(subscription?.will_cancel_at)}
                  </p>
                ) : subscription?.expires_at ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Next payment: {formatDate(subscription?.expires_at)}
                  </p>
                ) : null}
                {subscription?.auto_renew && subscription?.is_active && !subscription?.is_cancelled && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-renewing • Your membership will continue automatically</p>
                )}
              </div>

              {/* Action Buttons */}
              {subscription?.is_active && (
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {!subscription?.is_cancelled ? (
                    <button
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      {isCancelling ? (
                        <Spinner size="sm" />
                      ) : (
                        <FiXCircle className="h-4 w-4" />
                      )}
                      Cancel Membership
                    </button>
                  ) : (
                    <button
                      onClick={handleReactivate}
                      disabled={isReactivating}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      {isReactivating ? (
                        <Spinner size="sm" />
                      ) : (
                        <FiRefreshCw className="h-4 w-4" />
                      )}
                      Reactivate Membership
                    </button>
                  )}
                </div>
              )}

              {/* Info Message */}
              {subscription?.is_cancelled && subscription?.is_active && (
                <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">Membership will end {formatDate(subscription?.will_cancel_at)}</p>
                      <p className="text-xs text-orange-700 dark:text-orange-400">
                        You can reactivate your membership anytime before it ends.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCancelModal(false);
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full animate-scaleIn relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Close Button */}
              <button
                onClick={() => setShowCancelModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors z-10"
                aria-label="Close"
              >
                <FiXCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <FiXCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
                Cancel Membership?
              </h3>
              
              {/* Message */}
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  Are you sure you want to cancel your membership?
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FiInfo className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Your subscription will remain active until <span className="font-semibold">{formatDate(subscription?.expires_at)}</span>. 
                      You can reactivate it anytime before then.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Keep Membership
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <>
                      <Spinner size="sm" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Confirmation Modal */}
      {showReactivateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReactivateModal(false);
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full animate-scaleIn relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Close Button */}
              <button
                onClick={() => setShowReactivateModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors z-10"
                aria-label="Close"
              >
                <FiXCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <FiRefreshCw className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
                Reactivate Membership?
              </h3>
              
              {/* Message */}
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  Are you sure you want to reactivate your membership?
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-800 dark:text-green-300">
                      Your subscription will continue to auto-renew. You'll continue to have access to all features until 
                      <span className="font-semibold"> {formatDate(subscription?.expires_at)}</span>.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReactivateModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReactivate}
                  disabled={isReactivating}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {isReactivating ? (
                    <>
                      <Spinner size="sm" />
                      <span>Reactivating...</span>
                    </>
                  ) : (
                    'Yes, Reactivate'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSubscriptionList;

