'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Spinner from '@/components/common/loader/Spinner';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import queryKeys from '@/utils/query-keys';
import { getCertificationDashboard } from '@/services/private/certification/learning';
import EnrollmentTile from './EnrollmentTile';
import CareerLearnerPanel from './CareerLearnerPanel';
import ProfessionalLearnerPanel from './ProfessionalLearnerPanel';

const BUCKETS = {
  CONTINUE_LEARNING: 'continue_learning',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

const BUCKET_TABS = [
  { value: BUCKETS.CONTINUE_LEARNING, label: 'Continue Learning' },
  { value: BUCKETS.ACTIVE, label: 'Active' },
  { value: BUCKETS.COMPLETED, label: 'Completed' },
];

const DashboardSections = () => {
  const router = useRouter();
  const [selectedBucket, setSelectedBucket] = useState(BUCKETS.CONTINUE_LEARNING);

  const {
    data: response,
    isFetching,
    failureReason,
  } = useQuery({
    queryFn: getCertificationDashboard,
    queryKey: [queryKeys.certificationDashboard],
  });

  useHandleApiResponse(failureReason);

  const data = response?.data?.data;

  if (isFetching) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!data) return null;

  const enrollments = data[selectedBucket] || [];
  const hasAnyEnrollment = [BUCKETS.CONTINUE_LEARNING, BUCKETS.ACTIVE, BUCKETS.COMPLETED].some(
    bucket => (data[bucket] || []).length > 0
  );

  if (!hasAnyEnrollment) {
    return (
      <div className="w-full h-[200px] flex flex-col items-center justify-center gap-2 text-gray-500">
        <p className="font-medium">You haven&apos;t enrolled in any programs yet.</p>
        <p className="text-sm">Head to Discover to find a program that fits you.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={selectedBucket} onChange={(_, value) => setSelectedBucket(value)}>
        {BUCKET_TABS.map(tab => (
          <Tab key={tab.value} value={tab.value} label={`${tab.label} (${(data[tab.value] || []).length})`} />
        ))}
      </Tabs>

      {enrollments.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {enrollments.map(enrollment => (
            <EnrollmentTile
              key={enrollment.id}
              enrollment={enrollment}
              onClick={() => router.push(`/portal/customer/certification/${enrollment.program.id}/learn`)}
            />
          ))}
        </div>
      ) : (
        <div className="w-full h-[120px] flex justify-center items-center text-gray-500">Nothing here yet.</div>
      )}

      {data.learner_type === 'career' && <CareerLearnerPanel block={data.learner_block} />}
      {data.learner_type === 'professional' && <ProfessionalLearnerPanel block={data.learner_block} />}
    </div>
  );
};

export default DashboardSections;
