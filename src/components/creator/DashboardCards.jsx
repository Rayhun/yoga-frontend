'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import LinearProgress from '@mui/material/LinearProgress';
import ActivityItem from '@/components/common/dashboard/ActivityItem';
import CardShell from './CardShell';
import { activityEntries, attentionRows, funnelBars } from './dashboardModel';

const ActivityBarChart = dynamic(() => import('./ActivityBarChart'), { ssr: false });

export const ChartCard = ({ weekly, loading, error, onRetry, className }) => (
  <CardShell
    title="Enrollments and completions"
    subtitle="Last 12 weeks"
    loading={loading}
    error={error}
    onRetry={onRetry}
    className={className}
    skeletonLines={6}
  >
    <ActivityBarChart weekly={weekly} />
  </CardShell>
);

export const AttentionCard = ({ attention, loading, error, onRetry }) => {
  const rows = attentionRows(attention);
  return (
    <CardShell title="Needs your attention" loading={loading} error={error} onRetry={onRetry} skeletonLines={3}>
      {rows.length ? (
        <ul>
          {rows.map(row => (
            <li key={row.key} className="flex items-center justify-between gap-3 border-b border-gray-100 py-3 last:border-0 dark:border-gray-700">
              <span className="min-w-0 text-sm text-gray-700 dark:text-gray-200">{row.text}</span>
              {row.route ? (
                <Link href={row.route} className="shrink-0 text-sm font-semibold text-green-700 hover:underline">
                  {row.actionLabel} →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-6 text-center text-sm text-gray-400">Nothing needs your attention</p>
      )}
    </CardShell>
  );
};

export const FunnelCard = ({ funnel, loading, error, onRetry }) => (
  <CardShell title="Where learners are in the journey" loading={loading} error={error} onRetry={onRetry} skeletonLines={5}>
    <ul className="flex flex-col gap-3">
      {funnelBars(funnel).map(bar => (
        <li key={bar.key}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-200">{bar.label}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{bar.count}</span>
          </div>
          <LinearProgress variant="determinate" value={bar.percent} aria-label={`${bar.label}: ${bar.percent}% of enrolled learners`} />
        </li>
      ))}
    </ul>
  </CardShell>
);

export const RecentActivityCard = ({ items, loading, error, onRetry }) => {
  const entries = activityEntries(items);
  return (
    <CardShell title="Recent activity" loading={loading} error={error} onRetry={onRetry} skeletonLines={5}>
      {entries.length ? (
        entries.map(entry => (
          <ActivityItem key={entry.key} item={{ dot_color: entry.dotColor, time_ago: entry.timeAgo, time_title: entry.timeTitle }}>
            <strong>{entry.name}</strong> {entry.action} <strong>{entry.program}</strong>
          </ActivityItem>
        ))
      ) : (
        <p className="py-6 text-center text-sm text-gray-400">No activity yet</p>
      )}
    </CardShell>
  );
};
