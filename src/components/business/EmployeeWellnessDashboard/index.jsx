'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBusinessWellnessDashboard } from '@/services/private/business/wellness';
import queryKeys from '@/utils/query-keys';
import { 
  FiUsers, 
  FiTrendingUp, 
  FiActivity, 
  FiTarget,
  FiHeart,
  FiBarChart3,
  FiAward,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  FaHeartbeat, 
  FaChartPie, 
  FaUserCheck,
  FaExclamationTriangle
} from 'react-icons/fa';

const EmployeeWellnessDashboard = () => {
  const { 
    data: wellnessResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [queryKeys.businessWellnessDashboard],
    queryFn: getBusinessWellnessDashboard,
  });

  const wellnessData = wellnessResponse?.data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading wellness data: {error.message}</p>
      </div>
    );
  }

  if (!wellnessData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Wellness Data Available</h3>
        <p className="text-gray-500">Wellness data will appear here once employees start using wellness tracking features.</p>
      </div>
    );
  }

  const getWellnessColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    if (score > 0) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getWellnessStatusColor = (status) => {
    switch (status) {
      case 'Excellent': return 'text-green-600 bg-green-100';
      case 'Good': return 'text-blue-600 bg-blue-100';
      case 'Fair': return 'text-yellow-600 bg-yellow-100';
      case 'Needs Improvement': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
            <FaHeartbeat className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Employee Wellness Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              Combined wellness insights for your team
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{wellnessData.total_employees}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <FiUsers className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Employees with Wellness Data */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Wellness Data</p>
              <p className="text-3xl font-bold text-gray-900">{wellnessData.employees_with_wellness_data}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <FaUserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Average Wellness Score */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{wellnessData.average_wellness_score}%</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
              <FiTrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Wellness Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Excellent Health</p>
              <p className="text-3xl font-bold text-gray-900">{wellnessData.wellness_distribution.excellent}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
              <FiAward className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Wellness Distribution Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
            <FaChartPie className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Wellness Distribution</h3>
        </div>
        
        {/* Progress Bars for each category */}
        <div className="space-y-4">
          {[
            { key: 'excellent', label: 'Excellent', color: 'green', range: '80-100%', count: wellnessData.wellness_distribution.excellent },
            { key: 'good', label: 'Good', color: 'blue', range: '60-79%', count: wellnessData.wellness_distribution.good },
            { key: 'fair', label: 'Fair', color: 'yellow', range: '40-59%', count: wellnessData.wellness_distribution.fair },
            { key: 'needs_improvement', label: 'Needs Improvement', color: 'orange', range: '1-39%', count: wellnessData.wellness_distribution.needs_improvement },
            { key: 'no_data', label: 'No Data', color: 'gray', range: '0%', count: wellnessData.wellness_distribution.no_data }
          ].map((category) => {
            const percentage = wellnessData.total_employees > 0 ? (category.count / wellnessData.total_employees) * 100 : 0;
            const colorClasses = {
              green: 'bg-green-500',
              blue: 'bg-blue-500',
              yellow: 'bg-yellow-500',
              orange: 'bg-orange-500',
              gray: 'bg-gray-500'
            };
            
            return (
              <div key={category.key} className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium text-gray-700">{category.label}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${colorClasses[category.color]}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm font-semibold text-gray-900">{category.count}</span>
                  <span className="text-xs text-gray-500 ml-1">({Math.round(percentage)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Circular Progress Chart */}
        <div className="mt-8 flex justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#10b981"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(wellnessData.average_wellness_score / 100) * 251.2} 251.2`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{wellnessData.average_wellness_score}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Period Tracking Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg">
              <FiHeart className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Period Tracking</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Employees Tracking</span>
              <span className="font-semibold text-gray-900">{wellnessData.period_tracking_summary.total_tracking}</span>
            </div>
            
            {/* Progress bar for tracking participation */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Participation Rate</span>
                <span className="font-semibold text-gray-900">
                  {wellnessData.total_employees > 0 ? Math.round((wellnessData.period_tracking_summary.total_tracking / wellnessData.total_employees) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${wellnessData.total_employees > 0 ? (wellnessData.period_tracking_summary.total_tracking / wellnessData.total_employees) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Score</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getWellnessColor(wellnessData.period_tracking_summary.average_score)}`}>
                {wellnessData.period_tracking_summary.average_score}%
              </span>
            </div>
            
            {/* Score progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-400 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${wellnessData.period_tracking_summary.average_score}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Goal Tracking Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <FiTarget className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Goal Tracking</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Employees Tracking</span>
              <span className="font-semibold text-gray-900">{wellnessData.goal_tracking_summary.total_tracking}</span>
            </div>
            
            {/* Progress bar for tracking participation */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Participation Rate</span>
                <span className="font-semibold text-gray-900">
                  {wellnessData.total_employees > 0 ? Math.round((wellnessData.goal_tracking_summary.total_tracking / wellnessData.total_employees) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${wellnessData.total_employees > 0 ? (wellnessData.goal_tracking_summary.total_tracking / wellnessData.total_employees) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Score</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getWellnessColor(wellnessData.goal_tracking_summary.average_score)}`}>
                {wellnessData.goal_tracking_summary.average_score}%
              </span>
            </div>
            
            {/* Score progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${wellnessData.goal_tracking_summary.average_score}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Wellness Details */}
      {wellnessData.employee_wellness_details && wellnessData.employee_wellness_details.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
              <FiBarChart3 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Employee Wellness Details</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Overall Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Period Tracking</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Goal Tracking</th>
                </tr>
              </thead>
              <tbody>
                {wellnessData.employee_wellness_details.map((employee, index) => (
                  <tr key={employee.employee_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{employee.employee_name}</p>
                        <p className="text-sm text-gray-500">{employee.employee_email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getWellnessColor(employee.overall_wellness_score)}`}>
                        {employee.overall_wellness_score}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {employee.period_tracking.wellness_score > 0 ? (
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getWellnessStatusColor(employee.period_tracking.overall_status)}`}>
                            {employee.period_tracking.overall_status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{employee.period_tracking.tracker_name}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No data</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {employee.goal_tracking.wellness_score > 0 ? (
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getWellnessStatusColor(employee.goal_tracking.overall_status)}`}>
                            {employee.goal_tracking.overall_status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{employee.goal_tracking.tracker_title}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No data</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {wellnessData.employees_with_wellness_data === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Encourage Wellness Tracking</h3>
          <p className="text-blue-600">
            None of your employees have started wellness tracking yet. Encourage them to use the wellness features to see insights here.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeWellnessDashboard;
