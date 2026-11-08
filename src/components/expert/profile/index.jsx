'use client';
import { useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ExpertProfileAbout from './about';
import ExpertProfileGroupCoaching from './groupCoaching';
import ExpertProfileCertifications from './certifications';
import ExpertConsultations from './consultation';
import ExpertProfileWithLogo from '@/components/common/ExpertProfileWithLogo';
import useApprovedQTE from '@/hooks/useApprovedQTE';
import useAuthContext from '@/hooks/useAuthContext';
import { getOwnProfileTabs, isCertificationCreator, resolveOwnProfileTab } from '@/utils/profileTabs';
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const TABS = {
  WORKSHOPS: 'workshops',
  GROUP_COACHING: 'group_coaching',
  CERTIFICATIONS: 'certifications',
  CONSULT: 'consult',
  ABOUT: 'about',
};

const UserProfileDetails = ({ data: userProfileDetails }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname()
  const { user } = useAuthContext();
  const qte = useApprovedQTE();

  // QTE-track Experts (any status) and Institutions never see Guided Experiences: they get a Certification
  // Programs tab, and a URL asking for the guided tab is redirected to it. Plain Experts: unchanged.
  const role = user?.profile?.role;
  const certificationCreator = isCertificationCreator({ isQteTrack: qte.isQteTrack, role });
  const { tab: selectedTab, redirectTo } = resolveOwnProfileTab({
    activeTab: searchParams.get("active_tab"),
    certificationCreator,
  });
  const tabs = getOwnProfileTabs({ certificationCreator, profileComplete: userProfileDetails?.is_profile_complete });

  useEffect(() => {
    if (redirectTo) router.replace(`${pathname}?active_tab=${redirectTo}`);
  }, [redirectTo, pathname, router]);

  const handleTabChange = (_, newValue) => {
    router.replace(`${pathname}?active_tab=${newValue}`)
  };

  return (
    <div className='flex flex-col gap-6 animate-in fade-in duration-500'>
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-4 px-5 rounded-xl shadow-lg relative overflow-hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative flex-shrink-0 rounded-full bg-white/20 backdrop-blur-sm p-0.5 ring-2 ring-white/30">
            <ExpertProfileWithLogo
              src={userProfileDetails?.file || '/images/user/placeholder_profile.png'}
              logo={userProfileDetails?.business_logo}
              name={`${userProfileDetails?.first_name || ''} ${userProfileDetails?.last_name || ''}`}
              size={64}
              logoSize={28}
              logoRingClassName="ring-2 ring-white"
              alt="profile"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white truncate">
              {`${userProfileDetails?.first_name || ''} ${userProfileDetails?.last_name || ''}`}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6">
        <Tabs
          value={selectedTab}
          className="mb-4"
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
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
          {tabs.map(tab => (
            <Tab key={tab.value} value={tab.value} label={tab.label} className='!capitalize' disabled={tab.disabled} />
          ))}
        </Tabs>
        <div className="">
          {/* Tabs Content */}

          {/* PROGRAMS */}
          {/* <div hidden={selectedTab !== TABS.PROGRAMS}>
            <ExpertProfilePrograms tabEnabled={selectedTab === TABS.PROGRAMS} />
          </div> */}

          {/* WORKSHOPS */}
          {/* <div hidden={selectedTab !== TABS.WORKSHOPS}>Worksops</div> */}

          {certificationCreator ? (
            /* CERTIFICATION PROGRAMS (QTE / Institution) — Guided Experiences and Consult are never mounted */
            <div hidden={selectedTab !== TABS.CERTIFICATIONS}>
              <ExpertProfileCertifications
                creatorType={role === 'Institution' ? 'institution' : 'qte'}
                approved={qte.isApprovedQTE}
              />
            </div>
          ) : (
            <>
              {/* EVENTS */}
              <div hidden={selectedTab !== TABS.GROUP_COACHING}>
                <ExpertProfileGroupCoaching tabEnabled={selectedTab === TABS.GROUP_COACHING} />
              </div>

              {/* CONSULT  */}
              <div hidden={selectedTab !== TABS.CONSULT}>
                <ExpertConsultations tabEnabled={selectedTab === TABS.CONSULT} />
              </div>
            </>
          )}

          {/* ABOUT */}
          <div hidden={selectedTab !== TABS.ABOUT}>
            <ExpertProfileAbout data={userProfileDetails} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetails;
