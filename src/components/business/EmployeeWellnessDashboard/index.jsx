'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiTrendingUp, FiActivity, FiBarChart2 } from 'react-icons/fi';
import { FaHeartbeat } from 'react-icons/fa';
import { getBusinessWellnessDashboard } from '@/services/private/business/wellness';
import queryKeys from '@/utils/query-keys';

const OUTCOME_COLORS = {
  improving: 'text-emerald-700 bg-emerald-100',
  stable: 'text-amber-800 bg-amber-100',
  worsening: 'text-rose-700 bg-rose-100',
  insufficient_data: 'text-gray-600 bg-gray-100',
};

const OUTCOME_LABELS = {
  improving: 'Improving',
  stable: 'Stable',
  worsening: 'Worsening',
  insufficient_data: 'Insufficient data',
};

function OutcomeBar({ label, percent, count, barColor }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">
          {percent}% <span className="text-gray-400">({count})</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-200">
        <div className={`h-2.5 rounded-full ${barColor}`} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
    </div>
  );
}

const EmployeeWellnessDashboard = () => {
  const { data: wellnessResponse, isLoading, error } = useQuery({
    queryKey: [queryKeys.businessWellnessDashboard],
    queryFn: getBusinessWellnessDashboard,
  });

  const wellnessData = wellnessResponse?.data?.data;
  const dist = wellnessData?.outcome_distribution || {};

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-600">Error loading wellness data: {error.message}</p>
      </div>
    );
  }

  if (!wellnessData) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <FiActivity className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-700">No Wellness Data Available</h3>
        <p className="text-gray-500">
          Outcomes appear once employees complete v2 daily check-ins.
        </p>
      </div>
    );
  }

  const employees = wellnessData.employee_outcome_details || [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-3">
            <FaHeartbeat className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Employee Outcomes</h2>
            <p className="mt-1 text-gray-600">
              Weekly PRO-style trends from daily check-ins ({wellnessData.cohort_days || 28}-day window)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Total employees</p>
          <p className="text-3xl font-bold text-gray-900">{wellnessData.total_employees}</p>
          <FiUsers className="mt-2 text-primary" />
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Classified this week</p>
          <p className="text-3xl font-bold text-gray-900">{wellnessData.employees_with_wellness_data}</p>
          <FiBarChart2 className="mt-2 text-primary" />
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Engagement rate</p>
          <p className="text-3xl font-bold text-gray-900">{wellnessData.engagement_rate ?? 0}%</p>
          <FiActivity className="mt-2 text-primary" />
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Improving</p>
          <p className="text-3xl font-bold text-emerald-700">{dist.improving?.percent ?? 0}%</p>
          <FiTrendingUp className="mt-2 text-emerald-600" />
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Team outcome breakdown</h3>
        <div className="mt-4 space-y-4">
          <OutcomeBar
            label="Improving"
            percent={dist.improving?.percent ?? 0}
            count={dist.improving?.count ?? 0}
            barColor="bg-emerald-500"
          />
          <OutcomeBar
            label="Stable"
            percent={dist.stable?.percent ?? 0}
            count={dist.stable?.count ?? 0}
            barColor="bg-amber-400"
          />
          <OutcomeBar
            label="Worsening"
            percent={dist.worsening?.percent ?? 0}
            count={dist.worsening?.count ?? 0}
            barColor="bg-rose-400"
          />
        </div>
        {wellnessData.avg_wellbeing_change != null ? (
          <p className="mt-4 text-sm text-gray-600">
            Average wellbeing change:{' '}
            <strong>
              {wellnessData.avg_wellbeing_change > 0 ? '+' : ''}
              {wellnessData.avg_wellbeing_change}
            </strong>
          </p>
        ) : null}
      </div>

      {employees.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Employee details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Check-ins (week)</th>
                  <th className="px-4 py-3">Good days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map(emp => (
                  <tr key={emp.employee_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{emp.employee_name}</div>
                      <div className="text-xs text-gray-500">{emp.employee_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          OUTCOME_COLORS[emp.outcome_status] || OUTCOME_COLORS.insufficient_data
                        }`}
                      >
                        {emp.outcome_label || OUTCOME_LABELS[emp.outcome_status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{emp.confidence || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.checkins_this_week}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.good_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          No employees have enough check-in data yet. Encourage daily v2 check-ins on the home screen.
        </div>
      )}
    </div>
  );
};

export default EmployeeWellnessDashboard;
