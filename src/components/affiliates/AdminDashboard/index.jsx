'use client';
import React from 'react';
import CardDataStats from '../../stats/CardDataStats';
import { 
  FiUserCheck, 
  FiDollarSign, 
  FiUsers, 
  FiMousePointer,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { TbUsers, TbUsersGroup } from 'react-icons/tb';
import { HiOutlineCurrencyDollar } from 'react-icons/hi';
import { getAffiliatesUsersAdminDashboard } from '@/services/private/affiliates/dashboard';
import queryKeys from '@/utils/query-keys';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import EarningChart from '../EarningChart';

const AdminAffiliatedDashboard = () => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getAffiliatesUsersAdminDashboard(),
    queryKey: [queryKeys.affiliatesUsersAdminDashboard],
  });

  const dashboardData = response?.data?.data;

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  // Format currency values
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return '0';
    return new Intl.NumberFormat('en-US').format(value);
  };

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
              <h1 className="font-bold text-2xl md:text-3xl">Affiliate Dashboard</h1>
              <p className="text-green-100 text-sm md:text-base">Comprehensive overview of your affiliate program performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats Section */}
      <div>
        <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
          Overview Statistics
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:gap-6">
          <div className="group relative overflow-hidden rounded-xl border border-stroke bg-gradient-to-br from-white to-blue-50/50 px-6 py-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-blue-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-4">
                <TbUsers className="text-white" size={24} />
              </div>
              <h4 className="text-2xl font-bold text-black dark:text-white mb-1">
                {formatNumber(dashboardData?.total_affiliates)}
              </h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Affiliates</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-stroke bg-gradient-to-br from-white to-emerald-50/50 px-6 py-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-emerald-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg mb-4">
                <FiUserCheck className="text-white" size={24} />
              </div>
              <h4 className="text-2xl font-bold text-black dark:text-white mb-1">
                {formatNumber(dashboardData?.approved_affiliates)}
              </h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Affiliates</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-stroke bg-gradient-to-br from-white to-purple-50/50 px-6 py-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-purple-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg mb-4">
                <TbUsersGroup className="text-white" size={24} />
              </div>
              <h4 className="text-2xl font-bold text-black dark:text-white mb-1">
                {formatNumber(dashboardData?.total_referral_signups)}
              </h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Referrals</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-stroke bg-gradient-to-br from-white to-cyan-50/50 px-6 py-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-cyan-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg mb-4">
                <FiMousePointer className="text-white" size={24} />
              </div>
              <h4 className="text-2xl font-bold text-black dark:text-white mb-1">
                {formatNumber(dashboardData?.total_clicks)}
              </h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clicks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Stats Section */}
      <div>
        <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
          Financial Performance
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:gap-6">
          <div className="group relative overflow-hidden rounded-xl border border-stroke bg-gradient-to-br from-white to-green-50/50 px-6 py-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-green-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg mb-4">
                <HiOutlineCurrencyDollar className="text-white" size={24} />
              </div>
              <h4 className="text-2xl font-bold text-black dark:text-white mb-1">
                {formatCurrency(dashboardData?.total_sales_amount)}
              </h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sales</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-stroke bg-gradient-to-br from-white to-amber-50/50 px-6 py-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-amber-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg mb-4">
                <FiClock className="text-white" size={24} />
              </div>
              <h4 className="text-2xl font-bold text-black dark:text-white mb-1">
                {formatCurrency(dashboardData?.total_commission_unpaid)}
              </h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Commission</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-stroke bg-gradient-to-br from-white to-emerald-50/50 px-6 py-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-emerald-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg mb-4">
                <FiCheckCircle className="text-white" size={24} />
              </div>
              <h4 className="text-2xl font-bold text-black dark:text-white mb-1">
                {formatCurrency(dashboardData?.total_commission_paid)}
              </h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission Paid</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-stroke bg-gradient-to-br from-white to-red-50/50 px-6 py-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-red-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg mb-4">
                <FiXCircle className="text-white" size={24} />
              </div>
              <h4 className="text-2xl font-bold text-black dark:text-white mb-1">
                {formatCurrency(dashboardData?.total_commission_decline)}
              </h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission Declined</p>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Chart Section */}
      <div>
        <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
          Earnings Analytics
        </h2>
        <div className="rounded-xl border border-stroke bg-white shadow-xl overflow-hidden dark:border-strokedark dark:bg-boxdark">
          <EarningChart earnings_over_time={dashboardData?.earnings_over_time} />
        </div>
      </div>
    </div>
  );
};

export default AdminAffiliatedDashboard;
