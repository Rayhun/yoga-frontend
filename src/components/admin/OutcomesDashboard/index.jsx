'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiActivity, FiTrendingUp, FiUsers, FiBarChart2 } from 'react-icons/fi';
import { getAdminOutcomesDashboard } from '@/services/private/admin/outcomes';
import queryKeys from '@/utils/query-keys';
import { PageHeader } from '@/components/common/page';

const OUTCOME_COLORS = {
  improving: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  stable: 'bg-amber-50 text-amber-800 border-amber-200',
  worsening: 'bg-rose-50 text-rose-800 border-rose-200',
  insufficient_data: 'bg-stone-100 text-stone-600 border-stone-200',
};

function OutcomeBar({ label, percent, count, colorClass }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">
          {percent}% <span className="text-gray-400">({count})</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}

const AdminOutcomesDashboard = () => {
  const { data: response, isLoading, error } = useQuery({
    queryKey: [queryKeys.adminOutcomesDashboard],
    queryFn: () => getAdminOutcomesDashboard({ cohort_days: 28, min_engagement_checkins: 5 }),
  });

  const data = response?.data?.data;
  const dist = data?.outcome_distribution || {};

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Could not load outcomes: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outcome Dashboard"
        description="Platform-wide patient-reported outcomes from v2 daily check-ins (28-day cohort, ≥5 check-ins for engagement)."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total users</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{data?.total_users ?? 0}</p>
          <FiUsers className="mt-3 text-primary" size={22} />
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Classified cohort</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{data?.cohort_size ?? 0}</p>
          <FiBarChart2 className="mt-3 text-primary" size={22} />
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Engagement rate</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{data?.engagement_rate ?? 0}%</p>
          <FiActivity className="mt-3 text-primary" size={22} />
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Avg wellbeing change</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {data?.avg_wellbeing_change != null ? `${data.avg_wellbeing_change > 0 ? '+' : ''}${data.avg_wellbeing_change}` : '—'}
          </p>
          <FiTrendingUp className="mt-3 text-primary" size={22} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Outcome distribution</h3>
          <p className="mt-1 text-sm text-gray-500">Among users with sufficient weekly check-ins</p>
          <div className="mt-6 space-y-4">
            <OutcomeBar
              label="Improving"
              percent={dist.improving?.percent ?? 0}
              count={dist.improving?.count ?? 0}
              colorClass="bg-emerald-500"
            />
            <OutcomeBar
              label="Stable"
              percent={dist.stable?.percent ?? 0}
              count={dist.stable?.count ?? 0}
              colorClass="bg-amber-400"
            />
            <OutcomeBar
              label="Worsening"
              percent={dist.worsening?.percent ?? 0}
              count={dist.worsening?.count ?? 0}
              colorClass="bg-rose-400"
            />
            <OutcomeBar
              label="Insufficient data"
              percent={dist.insufficient_data?.percent ?? 0}
              count={dist.insufficient_data?.count ?? 0}
              colorClass="bg-stone-300"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Confidence breakdown</h3>
          <p className="mt-1 text-sm text-gray-500">Based on check-ins this week (≥5 high, 3–4 medium)</p>
          <dl className="mt-6 space-y-3">
            {['high', 'medium', 'low'].map(level => (
              <div key={level} className="flex items-center justify-between rounded-lg bg-stone-50 px-4 py-3">
                <dt className="capitalize text-gray-700">{level} confidence</dt>
                <dd className="font-semibold text-gray-900">{data?.confidence_breakdown?.[level] ?? 0}</dd>
              </div>
            ))}
          </dl>
          {data?.avg_symptom_reduction_percent != null ? (
            <p className="mt-6 text-sm text-gray-600">
              Avg symptom reduction: <strong>{data.avg_symptom_reduction_percent}%</strong>
            </p>
          ) : null}
        </div>
      </div>

      {data?.member_details?.length ? (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">User outcomes (sample)</h3>
            <p className="text-sm text-gray-500">First 50 users — full export via API</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Check-ins (week)</th>
                  <th className="px-4 py-3">Wellbeing Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.member_details.slice(0, 50).map(row => (
                  <tr key={row.user_id} className="hover:bg-stone-50/80">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{row.name}</div>
                      <div className="text-xs text-gray-500">{row.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          OUTCOME_COLORS[row.outcome_status] || OUTCOME_COLORS.insufficient_data
                        }`}
                      >
                        {row.outcome_label}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{row.confidence || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.checkins_this_week}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.wellbeing_delta != null ? `${row.wellbeing_delta > 0 ? '+' : ''}${row.wellbeing_delta}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminOutcomesDashboard;
