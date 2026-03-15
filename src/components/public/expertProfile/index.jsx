'use client';
import { useState } from 'react';
import Image from 'next/image';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PublicExpertPrograms from './programs';
import PublicExpertAbout from './about';
import PublicExpertGroupCoaching from './groupCoaching';
import PublicExpertConsultations from './consultations';

const TABS = {
  PROGRAMS: 'programs',
  GROUP_COACHING: 'group_coaching',
  CONSULT: 'consult',
  ABOUT: 'about',
};

const PublicExpertProfile = ({ data: expertData }) => {
  const [selectedTab, setSelectedTab] = useState(TABS.GROUP_COACHING);

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                <Image
                  src={expertData?.file || '/images/user/placeholder_profile.png'}
                  width={144}
                  height={144}
                  sizes="(max-width: 640px) 112px, 144px"
                  alt={`${expertData?.first_name || ''} ${expertData?.last_name || ''}`}
                  className="w-full h-full object-cover"
                  quality={95}
                  priority
                />
              </div>
            </div>
            <div className="text-center sm:text-left pb-2">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {`${expertData?.first_name || ''} ${expertData?.last_name || ''}`}
                </h1>
              </div>
              {expertData?.title && (
                <p className="text-gray-600 mt-1 text-base sm:text-lg">{expertData.title}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          classes={{ scroller: '!overflow-x-auto no-scrollbar' }}
          sx={{
            borderBottom: '1px solid #e5e7eb',
            '& .MuiTab-root': {
              textTransform: 'capitalize',
              fontWeight: 500,
              fontSize: '0.95rem',
              padding: '16px 24px',
            },
          }}
        >
          <Tab value={TABS.GROUP_COACHING} label="Guided Experiences" />
          <Tab value={TABS.ABOUT} label="About" />
        </Tabs>

        <div className="p-4 sm:p-6">
          <div hidden={selectedTab !== TABS.ABOUT}>
            <PublicExpertAbout data={expertData} />
          </div>

          <div hidden={selectedTab !== TABS.PROGRAMS}>
            <PublicExpertPrograms expertId={expertData?.id} tabEnabled={selectedTab === TABS.PROGRAMS} />
          </div>

          <div hidden={selectedTab !== TABS.GROUP_COACHING}>
            <PublicExpertGroupCoaching
              expertId={expertData?.id}
              tabEnabled={selectedTab === TABS.GROUP_COACHING}
            />
          </div>

          <div hidden={selectedTab !== TABS.CONSULT}>
            <PublicExpertConsultations expertId={expertData?.id} tabEnabled={selectedTab === TABS.CONSULT} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicExpertProfile;
