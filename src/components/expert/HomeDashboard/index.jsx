'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FiLink2, FiUsers } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { MdOutlinePayments } from 'react-icons/md';
import useToggle from '@/hooks/useToggle';
import ActivityItem from '@/components/common/dashboard/ActivityItem';
import StatCard from '@/components/common/dashboard/StatCard';
import StatGrid from '@/components/common/dashboard/StatGrid';
import CircleCompositionSnapshotModal from './CircleCompositionSnapshotModal';

const CommunityGrowthChart = dynamic(() => import('./CommunityGrowthChart'), { ssr: false });

const STAT_ICONS = {
  members: FiUsers,
  earnings: MdOutlinePayments,
  referrals: FiLink2,
  workshops: HiOutlineAcademicCap,
};

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
      <StatGrid>
        {stats.map(stat => (
          <StatCard key={stat.id} stat={stat} Icon={STAT_ICONS[stat.icon] || FiUsers} />
        ))}
      </StatGrid>

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
