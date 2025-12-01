'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiTrendingUp, FiFilter, FiSearch, FiCheckCircle, FiClock, FiXCircle, FiEye } from 'react-icons/fi';
import { getPayoutList } from '@/services/private/affiliates/payout';
import queryKeys from '@/utils/query-keys';
import PageLoader from '@/components/common/loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import useModal from '@/hooks/useModal';
import AdminTransactionDetails from './AdminTransactionDetails';

const AdminTransactions = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { render: renderModal } = useModal();
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getPayoutList({ 
      status: statusFilter || undefined,
    }),
    queryKey: [queryKeys.payoutList, statusFilter],
  });

  const transactions = response?.data?.data || [];

  useHandleApiResponse(failureReason);

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      Approved: {
        bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
        text: 'text-green-700',
        icon: FiCheckCircle,
        label: 'Paid',
      },
      Pending: {
        bg: 'bg-gradient-to-r from-amber-100 to-yellow-100',
        text: 'text-amber-700',
        icon: FiClock,
        label: 'Pending',
      },
      Declined: {
        bg: 'bg-gradient-to-r from-red-100 to-pink-100',
        text: 'text-red-700',
        icon: FiXCircle,
        label: 'Declined',
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  // Filter transactions by search
  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.affiliate_email?.toLowerCase().includes(query) ||
        t.affiliate_name?.toLowerCase().includes(query) ||
        t.user_email?.toLowerCase().includes(query) ||
        t.user_name?.toLowerCase().includes(query) ||
        t.commission_amount?.includes(query)
    );
  }, [transactions, searchQuery]);

  // Handle transaction click
  const handleTransactionClick = async (transaction) => {
    await renderModal({
      heading: `Transaction #${transaction.id} Details`,
      content: <AdminTransactionDetails transaction={transaction} queryClient={queryClient} onStatusUpdate={() => queryClient.invalidateQueries([queryKeys.payoutList])} />,
      size: 'md',
    });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-8 px-6 rounded-2xl shadow-2xl mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <FiTrendingUp size={24} />
            </div>
            <div>
              <h1 className="font-bold text-2xl md:text-3xl">Affiliate Transactions</h1>
              <p className="text-green-100 text-sm md:text-base">Manage all affiliate commission transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-stroke bg-white shadow-lg p-6 dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by affiliate, user email or name..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stroke bg-white focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-xl border border-stroke bg-white focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark appearance-none min-w-[180px]"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Paid</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-stroke bg-white shadow-lg overflow-hidden dark:border-strokedark dark:bg-boxdark">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <FiTrendingUp className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {searchQuery || statusFilter ? 'Try adjusting your filters' : 'Transaction records will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Affiliate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    User (Buyer)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Subscription Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-boxdark divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    onClick={() => handleTransactionClick(transaction)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.affiliate_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.affiliate_email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.user_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.user_email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(transaction.user_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(transaction.commission_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {transaction.month_number ? `Month ${transaction.month_number}` : 'N/A'}
                      </div>
                      {transaction.payout_due_date && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {new Date(transaction.payout_due_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDateTime(transaction.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTransactionClick(transaction);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-primary"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-stroke bg-gradient-to-br from-white to-green-50/50 px-6 py-4 shadow-lg dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-green-900/20">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Transactions</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredTransactions.length}</div>
          </div>
          <div className="rounded-xl border border-stroke bg-gradient-to-br from-white to-emerald-50/50 px-6 py-4 shadow-lg dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-emerald-900/20">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Commission</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(
                filteredTransactions.reduce(
                  (sum, t) => sum + parseFloat(t.commission_amount || 0),
                  0
                )
              )}
            </div>
          </div>
          <div className="rounded-xl border border-stroke bg-gradient-to-br from-white to-amber-50/50 px-6 py-4 shadow-lg dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-amber-900/20">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Pending Amount</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(
                filteredTransactions
                  .filter((t) => t.status === 'Pending')
                  .reduce((sum, t) => sum + parseFloat(t.commission_amount || 0), 0)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;

