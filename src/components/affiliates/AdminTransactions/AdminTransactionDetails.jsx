'use client';

import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { 
  FiUser, 
  FiDollarSign, 
  FiCalendar, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle,
  FiInfo,
  FiMail,
  FiShield
} from 'react-icons/fi';
import { DetailsRecord } from '@/components/common/details';
import { updatePayoutStatus } from '@/services/private/affiliates/payout';
import queryKeys from '@/utils/query-keys';
import useConfirm from '@/hooks/useConfirm';
import { toastApiError } from '@/utils/helpers';

const AdminTransactionDetails = ({ transaction, done, queryClient, onStatusUpdate }) => {
  const confirm = useConfirm();

  const { mutateAsync: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: updatePayoutStatus,
  });

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(value));
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status config
  const getStatusConfig = (status) => {
    const configs = {
      Approved: {
        bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
        text: 'text-green-700',
        icon: FiCheckCircle,
        label: 'Paid',
        description: 'This commission has been successfully paid out.',
      },
      Pending: {
        bg: 'bg-gradient-to-r from-amber-100 to-yellow-100',
        text: 'text-amber-700',
        icon: FiClock,
        label: 'Pending',
        description: 'This commission is pending approval and payment.',
      },
      Declined: {
        bg: 'bg-gradient-to-r from-red-100 to-pink-100',
        text: 'text-red-700',
        icon: FiXCircle,
        label: 'Declined',
        description: 'This commission has been declined.',
      },
    };
    return configs[status] || configs.Pending;
  };

  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;

  const handleApprove = async () => {
    try {
      await confirm({
        message: `Are you sure you want to approve and pay out commission #${transaction.id}?`,
      });
      await updateStatus({ payload: { commission_id: transaction.id, status: 'Approved' } });
      toast.success('Commission approved and marked as paid successfully');
      if (onStatusUpdate) onStatusUpdate();
      if (done) done();
    } catch (error) {
      // Only show error if it's not a user cancellation
      if (error?.message !== 'User cancelled') {
        toastApiError(error);
      }
    }
  };

  const handleDecline = async () => {
    try {
      await confirm({
        message: `Are you sure you want to decline commission #${transaction.id}? This action cannot be undone.`,
      });
      await updateStatus({ payload: { commission_id: transaction.id, status: 'Declined' } });
      toast.success('Commission declined successfully');
      if (onStatusUpdate) onStatusUpdate();
      if (done) done();
    } catch (error) {
      // Only show error if it's not a user cancellation
      if (error?.message !== 'User cancelled') {
        toastApiError(error);
      }
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Status Header */}
      <div className={`rounded-xl ${statusConfig.bg} p-4 border-2 ${statusConfig.text} border-opacity-30`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${statusConfig.bg} flex items-center justify-center shadow-lg flex-shrink-0`}>
            <StatusIcon size={24} className={statusConfig.text} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold mb-1">Transaction #{transaction.id}</h3>
            <p className="text-xs sm:text-sm opacity-80">{statusConfig.description}</p>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-xs sm:text-sm font-medium opacity-80 mb-1">Status</div>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-lg font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
              <StatusIcon size={16} />
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {transaction.status === 'Pending' && (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiCheckCircle size={18} />
            )}
            Approve & Pay
          </button>
          <button
            onClick={handleDecline}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiXCircle size={18} />
            )}
            Decline
          </button>
        </div>
      )}

      {/* Affiliate Information */}
      <div className="rounded-xl border border-stroke bg-white shadow-lg p-4 dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <FiShield className="text-white" size={16} />
          </div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Affiliate Information</h4>
        </div>
        <div className="space-y-3">
          <DetailsRecord label="Affiliate Name">
            <span className="font-medium text-sm">{transaction.affiliate_name || 'N/A'}</span>
          </DetailsRecord>
          <DetailsRecord label="Affiliate Email">
            <span className="font-medium text-sm break-all">{transaction.affiliate_email || 'N/A'}</span>
          </DetailsRecord>
          {transaction.affiliate_id && (
            <DetailsRecord label="Affiliate ID">
              <span className="font-mono text-xs">#{transaction.affiliate_id}</span>
            </DetailsRecord>
          )}
        </div>
      </div>

      {/* User Information */}
      <div className="rounded-xl border border-stroke bg-white shadow-lg p-4 dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <FiUser className="text-white" size={16} />
          </div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">User Information (Buyer)</h4>
        </div>
        <div className="space-y-3">
          <DetailsRecord label="User Name">
            <span className="font-medium text-sm">{transaction.user_name || 'N/A'}</span>
          </DetailsRecord>
          <DetailsRecord label="User Email">
            <span className="font-medium text-sm break-all">{transaction.user_email || 'N/A'}</span>
          </DetailsRecord>
          {transaction.user_id && (
            <DetailsRecord label="User ID">
              <span className="font-mono text-xs">#{transaction.user_id}</span>
            </DetailsRecord>
          )}
          {transaction.subscription_id && (
            <DetailsRecord label="Subscription ID">
              <span className="font-mono text-xs">#{transaction.subscription_id}</span>
            </DetailsRecord>
          )}
        </div>
      </div>

      {/* Financial Information */}
      <div className="rounded-xl border border-stroke bg-white shadow-lg p-4 dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
            <FiDollarSign className="text-white" size={16} />
          </div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Financial Details</h4>
        </div>
        <div className="space-y-3">
          <DetailsRecord label="Subscription Amount">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(transaction.user_amount)}
            </span>
          </DetailsRecord>
          <DetailsRecord label="Commission Amount">
            <span className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(transaction.commission_amount)}
            </span>
          </DetailsRecord>
          {transaction.month_number && (
            <DetailsRecord label="Month Number">
              <span className="font-medium text-sm">Month {transaction.month_number}</span>
            </DetailsRecord>
          )}
        </div>
      </div>

      {/* Timeline Information */}
      <div className="rounded-xl border border-stroke bg-white shadow-lg p-4 dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
            <FiCalendar className="text-white" size={16} />
          </div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Timeline</h4>
        </div>
        <div className="space-y-3">
          <DetailsRecord label="Created At">
            <span className="font-medium text-sm">{formatDateTime(transaction.created_at)}</span>
          </DetailsRecord>
          <DetailsRecord label="Last Updated">
            <span className="font-medium text-sm">{formatDateTime(transaction.updated_at)}</span>
          </DetailsRecord>
          {transaction.payout_due_date && (
            <DetailsRecord label="Payout Due Date">
              <span className="font-medium text-sm text-amber-600 dark:text-amber-400">
                {formatDate(transaction.payout_due_date)}
              </span>
            </DetailsRecord>
          )}
          {transaction.paid_at && (
            <DetailsRecord label="Paid At">
              <span className="font-medium text-sm text-green-600 dark:text-green-400">
                {formatDateTime(transaction.paid_at)}
              </span>
            </DetailsRecord>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="rounded-xl border border-stroke bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-strokedark dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-start gap-2">
          <FiInfo className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" size={16} />
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-1">Transaction Information</p>
            <p>
              This transaction represents a commission earned from a referral subscription. 
              {transaction.status === 'Pending' && ' You can approve or decline this commission payout.'}
              {transaction.status === 'Approved' && ' This commission has been successfully paid out to the affiliate.'}
              {transaction.status === 'Declined' && ' This commission was declined and will not be paid out.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionDetails;

