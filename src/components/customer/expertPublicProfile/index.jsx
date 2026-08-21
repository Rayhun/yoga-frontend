'use client';
import { useEffect, useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ExpertProfileWithLogo from '@/components/common/ExpertProfileWithLogo';
import ExpertProfilePrograms from './programs';
import UserProfileAbout from './about';
import ExpertProfileGroupCoaching from './groupCoaching';
import ExpertProfileConsultations from './consultations';
import {
  getCustomerCoachDetail,
  toggleFollowCoach,
} from '@/services/private/customer/v2/coaches';
import queryKeys from '@/utils/query-keys';

const getPracticeTypeLabel = profile =>
  profile?.practice_type?.label?.trim() ||
  profile?.practice_type?.canonical_tag?.trim() ||
  profile?.title?.trim() ||
  '';

const TABS = {
  PROGRAMS: 'programs',
  WORKSHOPS: 'workshops',
  GROUP_COACHING: 'group_coaching',
  CONSULT: 'consult',
  ABOUT: 'about',
};

const UserProfileDetails = ({ data: userProfileDetails }) => {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const activeTab = searchParams.get('active_tab');
  const expertId = userProfileDetails?.id;

  const { data: coachDetailResponse } = useQuery({
    queryKey: [queryKeys.customerV2CoachDetail, expertId],
    queryFn: () => getCustomerCoachDetail(expertId),
    enabled: Boolean(expertId),
    staleTime: 30_000,
  });

  const coachFollowButton = coachDetailResponse?.data?.data?.coach?.follow_button;
  const coachTitle = coachDetailResponse?.data?.data?.coach?.title;

  const [followState, setFollowState] = useState({
    isFollow: false,
    label: '+ Follow',
  });

  useEffect(() => {
    if (!coachFollowButton) return;
    setFollowState({
      isFollow: Boolean(coachFollowButton.is_follow),
      label: coachFollowButton.label || (coachFollowButton.is_follow ? 'Following' : '+ Follow'),
    });
  }, [coachFollowButton]);

  const followMutation = useMutation({
    mutationFn: () => toggleFollowCoach(expertId),
    onSuccess: response => {
      const payload = response?.data?.data;
      setFollowState({
        isFollow: Boolean(payload?.is_follow),
        label: payload?.label || (payload?.is_follow ? 'Following' : '+ Follow'),
      });
      queryClient.invalidateQueries({ queryKey: [queryKeys.customerV2CoachDetail, expertId] });
      toast.success(
        payload?.is_follow ? 'You are now following this coach.' : 'You unfollowed this coach.'
      );
    },
    onError: () => {
      toast.error('Could not update follow status. Please try again.');
    },
  });

  const practiceType = useMemo(
    () => getPracticeTypeLabel(userProfileDetails) || coachTitle || '',
    [userProfileDetails, coachTitle]
  );
  const expertName = `${userProfileDetails?.first_name || ''} ${userProfileDetails?.last_name || ''}`.trim();
  
  const [selectedTab, setSelectedTab] = useState(() => {
    // Set initial tab based on URL parameter
    if (activeTab === 'about') return TABS.ABOUT;
    if (activeTab === 'programs') return TABS.PROGRAMS;
    if (activeTab === 'group_coaching') return TABS.GROUP_COACHING;
    if (activeTab === 'consult') return TABS.CONSULT;
    return TABS.PROGRAMS; // default
  });

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-4 px-5 rounded-xl shadow-lg relative overflow-hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative flex-shrink-0 rounded-full bg-white/20 backdrop-blur-sm p-0.5 ring-2 ring-white/30">
            <ExpertProfileWithLogo
              src={userProfileDetails?.file}
              logo={userProfileDetails?.business_logo}
              name={expertName}
              size={64}
              logoSize={28}
              logoRingClassName="ring-2 ring-white"
              alt={expertName || 'Coach'}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white truncate">
              {`${userProfileDetails?.first_name || ''} ${userProfileDetails?.last_name || ''}`}
            </h3>
            {practiceType ? (
              <p className="mt-0.5 truncate text-sm text-white/85">{practiceType}</p>
            ) : null}
          </div>

          {expertId ? (
            <button
              type="button"
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                followState.isFollow
                  ? 'border border-white/70 bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white text-primary hover:bg-white/90'
              }`}
            >
              {followMutation.isPending ? 'Saving…' : followState.label}
            </button>
          ) : null}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
        <Tabs
          value={selectedTab}
          className="mb-4"
          onChange={handleTabChange}
          classes={{ scroller: '!overflow-x-auto no-scrollbar' }}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              color: '#6b7280',
              '&.Mui-selected': {
                color: '#10b981',
                fontWeight: 600,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#10b981',
              height: 3,
            },
          }}
        >
          {/* <Tab value={TABS.PROGRAMS} label="Programs" className="!capitalize" /> */}
          {/* <Tab disabled value={TABS.WORKSHOPS} label="Workshops" /> */}
          <Tab value={TABS.GROUP_COACHING} label="Guided Experiences" className="!capitalize" />
          {/* <Tab value={TABS.CONSULT} label="Consult" className="!capitalize" /> */}
          <Tab value={TABS.ABOUT} label="About" className="!capitalize" />
        </Tabs>
        <div className="">
          {/* Tabs Content */}

          {/* PROGRAMS */}
          <div hidden={selectedTab !== TABS.PROGRAMS}>
            <ExpertProfilePrograms tabEnabled={selectedTab === TABS.PROGRAMS} />
          </div>

          {/* WORKSHOPS */}
          {/* <div hidden={selectedTab !== TABS.WORKSHOPS}>Worksops</div> */}

          {/* EVENTS */}
          <div hidden={selectedTab !== TABS.GROUP_COACHING}>
            <ExpertProfileGroupCoaching tabEnabled={selectedTab === TABS.GROUP_COACHING} />
          </div>

          {/* CONSULT */}
          <div hidden={selectedTab !== TABS.CONSULT}>
            <ExpertProfileConsultations tabEnabled={selectedTab === TABS.CONSULT} />
          </div>

          {/* ABOUT */}
          <div hidden={selectedTab !== TABS.ABOUT}>
            <UserProfileAbout data={userProfileDetails} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetails;
