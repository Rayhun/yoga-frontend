'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FiLink2, FiUsers } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { MdOutlinePayments } from 'react-icons/md';
import useToggle from '@/hooks/useToggle';
import CircleCompositionSnapshotModal from './CircleCompositionSnapshotModal';

const CommunityGrowthChart = dynamic(() => import('./CommunityGrowthChart'), { ssr: false });

const STAT_ICONS = {
  members: FiUsers,
  earnings: MdOutlinePayments,
  referrals: FiLink2,
  workshops: HiOutlineAcademicCap,
};

const StatCard = ({ stat }) => {
  const Icon = STAT_ICONS[stat.icon] || FiUsers;
  const showChange = typeof stat.change_percent === 'number';
  const isUp = stat.change_direction !== 'down';

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {stat.live_label ? (
        <span className="absolute right-4 top-4 text-xs font-semibold text-[#2E7D32]">
          {stat.live_label}
        </span>
      ) : showChange ? (
        <span
          className={`absolute right-4 top-4 inline-flex items-center gap-0.5 text-xs font-semibold ${
            isUp ? 'text-[#2E7D32]' : 'text-red-500'
          }`}
        >
          <span aria-hidden>{isUp ? '▲' : '▼'}</span>
          {Math.abs(stat.change_percent)}%
        </span>
      ) : null}

      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: stat.icon_bg || '#F3F4F6', color: stat.icon_color || '#6B7280' }}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="font-serif text-3xl font-semibold tracking-tight text-gray-900">
        {stat.value_display}
      </p>
      <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
    </div>
  );
};

const ActivityItem = ({ item }) => (
  <div className="flex items-start gap-3 border-b border-gray-100 py-3.5 last:border-0">
    <span
      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: item.dot_color || '#9CA3AF' }}
    />
    <p
      className="min-w-0 flex-1 text-sm leading-relaxed text-gray-700 [&_strong]:font-semibold [&_strong]:text-gray-900"
      dangerouslySetInnerHTML={{ __html: item.text || item.plain_text }}
    />
    <span className="shrink-0 text-xs text-gray-400">{item.time_ago}</span>
  </div>
);

const DashboardBanner = ({ banner, onCtaClick, fallbackCtaLabel = 'View' }) => {
  if (!banner?.title) return null;

  const handleCtaClick = event => {
    if (banner.cta_action && onCtaClick) {
      event.preventDefault();
      onCtaClick(banner);
    }
  };

  const ctaContent = (
    <span className="shrink-0 text-sm font-semibold text-[#1E4D35] transition hover:underline">
      {banner.cta_label || fallbackCtaLabel} →
    </span>
  );

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      style={{ backgroundColor: banner.background_color || '#EAF5EE' }}
    >
      <p className="text-sm text-gray-700 sm:text-[15px]">
        <span className="mr-1.5">{banner.icon || '🍀'}</span>
        <span className="font-semibold text-gray-900">{banner.title}</span>
        {banner.text ? <span className="text-gray-600"> — {banner.text}</span> : null}
      </p>
      {banner.cta_action ? (
        <button type="button" onClick={handleCtaClick} className="text-left">
          {ctaContent}
        </button>
      ) : banner.cta_url ? (
        <Link href={banner.cta_url} className="shrink-0">
          {ctaContent}
        </Link>
      ) : null}
    </div>
  );
};

const ExpertHomeDashboard = ({ data }) => {
  const { isOpen: isSnapshotOpen, setIsOpen: setSnapshotOpen } = useToggle();

  if (!data) return null;
  const stats = data.stats || [];
  const growth = data.community_growth || {};
  const activity = data.recent_activity || {};
  const banners = [data.snapshot_banner, data.cycle_insight_banner].filter(Boolean);

  const handleBannerCtaClick = banner => {
    if (banner.cta_action === 'open_composition_snapshot') {
      setSnapshotOpen(true);
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 md:gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {banners.map(banner => (
        <DashboardBanner
          key={banner.title}
          banner={banner}
          onCtaClick={handleBannerCtaClick}
        />
      ))}

      <CircleCompositionSnapshotModal
        open={isSnapshotOpen}
        onClose={() => setSnapshotOpen(false)}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-serif text-xl font-semibold text-gray-900">
            {growth.title || 'Community Growth'}
          </h2>
          {growth.subtitle ? (
            <p className="mt-1 text-sm text-gray-500">{growth.subtitle}</p>
          ) : null}
          <div className="mt-2 w-full">
            <CommunityGrowthChart points={growth.points || []} />
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-serif text-xl font-semibold text-gray-900">
            {activity.title || 'Recent Activity'}
          </h2>
          {activity.subtitle ? (
            <p className="mt-1 text-sm text-gray-500">{activity.subtitle}</p>
          ) : null}

          <div className="mt-2">
            {(activity.items || []).length ? (
              activity.items.map(item => <ActivityItem key={item.id} item={item} />)
            ) : (
              <p className="py-10 text-center text-sm text-gray-400">
                {activity.empty_text || 'No recent activity yet.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertHomeDashboard;
