'use client';
import { useState } from 'react';
import Image from 'next/image';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ExpertProfilePrograms from './programs';
import ExpertProfileAbout from './about';
import ExpertProfileGroupCoaching from './groupCoaching';
import ExpertConsultations from './consultation';
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const TABS = {
  // PROGRAMS: 'programs',
  WORKSHOPS: 'workshops',
  GROUP_COACHING: 'group_coaching',
  CONSULT: 'consult',
  ABOUT: 'about',
};

const UserProfileDetails = ({ data: userProfileDetails }) => {
  // const [selectedTab, setSelectedTab] = useState(TABS.PROGRAMS);
  const searchParams = useSearchParams();
  const selectedTab = searchParams.get("active_tab") || TABS.ABOUT;
  const router = useRouter();
  const pathname = usePathname()

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
          <div className="relative flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm p-0.5 ring-2 ring-white/30">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={userProfileDetails?.file || '/images/user/placeholder_profile.png'}
                  width={64}
                  height={64}
                  sizes="64px"
                  alt="profile"
                  className="w-full h-full rounded-full object-cover"
                  quality={95}
                  priority
                />
              </div>
            </div>
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
          {/* <Tab value={TABS.PROGRAMS} label="Programs" className='!capitalize' /> */}
          {/* <Tab disabled value={TABS.WORKSHOPS} label="Workshops" /> */}
          <Tab value={TABS.GROUP_COACHING} label="Guided Experiences" className='!capitalize' disabled={!userProfileDetails?.is_profile_complete} />
          {/* <Tab value={TABS.CONSULT} label="Consult" className='!capitalize'  disabled={!userProfileDetails?.is_profile_complete} /> */}
          <Tab value={TABS.ABOUT} label="About" className='!capitalize' />
        </Tabs>
        <div className="">
          {/* Tabs Content */}

          {/* PROGRAMS */}
          {/* <div hidden={selectedTab !== TABS.PROGRAMS}>
            <ExpertProfilePrograms tabEnabled={selectedTab === TABS.PROGRAMS} />
          </div> */}

          {/* WORKSHOPS */}
          {/* <div hidden={selectedTab !== TABS.WORKSHOPS}>Worksops</div> */}

          {/* EVENTS */}
          <div hidden={selectedTab !== TABS.GROUP_COACHING}>
            <ExpertProfileGroupCoaching tabEnabled={selectedTab === TABS.GROUP_COACHING} />
          </div>

          {/* CONSULT  */}
          <div hidden={selectedTab !== TABS.CONSULT}>
            <ExpertConsultations tabEnabled={selectedTab === TABS.CONSULT} />
          </div>

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
