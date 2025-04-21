'use client';
import { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import GroupCoachingLibrary from './GroupCoachingLiabrary';
import EnrolledGroupCoachings from './EnrolledGroupCoachings';

const TABS = {
  LIBRARY: 'library',
  ENROLLED_COACHINGS: 'enrolled-coachings',
};

const GroupCoaching = () => {
  const [selectedTab, setSelectedTab] = useState(TABS.LIBRARY);

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div>
      {/* Tabs */}
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab value={TABS.LIBRARY} label="Library" className='!capitalize' />
        <Tab value={TABS.ENROLLED_COACHINGS} label="Enrolled Group Coachings" className='!capitalize' />
      </Tabs>
      <div className="py-5">
        {/* Tabs Content */}
        <div hidden={selectedTab !== TABS.LIBRARY}>
          <GroupCoachingLibrary />
        </div>
        <div hidden={selectedTab !== TABS.ENROLLED_COACHINGS}>
          <EnrolledGroupCoachings />
        </div>
      </div>
    </div>
  );
};

export default GroupCoaching;
