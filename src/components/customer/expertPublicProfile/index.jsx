'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useSearchParams } from 'next/navigation';
import ExpertProfilePrograms from './programs';
import UserProfileAbout from './about';
import ExpertProfileGroupCoaching from './groupCoaching';
import ExpertProfileConsultations from './consultations';

const TABS = {
  PROGRAMS: 'programs',
  WORKSHOPS: 'workshops',
  GROUP_COACHING: 'group_coaching',
  CONSULT: 'consult',
  ABOUT: 'about',
};

const UserProfileDetails = ({ data: userProfileDetails }) => {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('active_tab');
  
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
          <div className="relative flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm p-0.5 ring-2 ring-white/30">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={userProfileDetails?.file || '/images/user/user-06.png'}
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
