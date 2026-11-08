'use client';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { FiAward, FiBookOpen, FiCheckCircle, FiUsers } from 'react-icons/fi';
import StatCard from '@/components/common/dashboard/StatCard';
import StatGrid from '@/components/common/dashboard/StatGrid';
import { buildKpiCards } from './dashboardModel';

// Same typeface as the page title (the Expert dashboard's serif numbers are its own look).
const VALUE_CLASSES = 'text-3xl font-semibold tracking-tight text-gray-900';
const ICONS = { programs: FiBookOpen, learners: FiUsers, certificates: FiAward, completion: FiCheckCircle };

const KpiRow = ({ kpis, loading, error, onRetry }) => {
  if (loading) {
    return (
      <StatGrid>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} variant="rounded" height={132} />
        ))}
      </StatGrid>
    );
  }
  if (error) {
    return (
      <div role="alert" className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">Couldn&apos;t load your numbers.</p>
        <Button variant="outlined" size="small" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }
  return (
    <StatGrid>
      {buildKpiCards(kpis).map(card => (
        <StatCard
          key={card.id}
          stat={card.stat}
          Icon={ICONS[card.icon]}
          subline={card.subline}
          valueClassName={VALUE_CLASSES}
        />
      ))}
    </StatGrid>
  );
};

export default KpiRow;
