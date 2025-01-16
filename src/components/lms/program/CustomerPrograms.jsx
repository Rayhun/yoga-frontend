'use client';
import { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ProgramsLibrary from './ProgramLibrary';
import CustomerEnrolledPrograms from './CustomerEnrolledPrograms';

const TABS = {
  LIBRARY: 'library',
  MY_PROGRAMS: 'my-programs',
};

const CustomerPrograms = () => {
  const [selectedTab, setSelectedTab] = useState(TABS.LIBRARY);

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div>
      {/* Tabs */}
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab value={TABS.LIBRARY} label="Library" />
        <Tab value={TABS.MY_PROGRAMS} label="My Programs" />
      </Tabs>
      <div className="py-5">
        {/* Tabs Content */}
        <div hidden={selectedTab !== TABS.LIBRARY}>
          <ProgramsLibrary />
        </div>
        <div hidden={selectedTab !== TABS.MY_PROGRAMS}>
          <CustomerEnrolledPrograms />
        </div>
      </div>
    </div>
  );
};

export default CustomerPrograms;
