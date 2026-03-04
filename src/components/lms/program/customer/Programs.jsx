'use client';
import { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ProgramsLibrary from './ProgramLibrary';
import EnrolledPrograms from './EnrolledPrograms';

const TABS = {
  LIBRARY: 'library',
  MY_PROGRAMS: 'my-programs',
};

const Programs = () => {
  const [selectedTab, setSelectedTab] = useState(TABS.MY_PROGRAMS);

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div>
      {/* Tabs */}
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab value={TABS.MY_PROGRAMS} label="My Programs" />
        <Tab value={TABS.LIBRARY} label="Library" />
      </Tabs>
      <div className="py-5">
        {/* Tabs Content */}
        <div hidden={selectedTab !== TABS.LIBRARY}>
          <ProgramsLibrary />
        </div>
        <div hidden={selectedTab !== TABS.MY_PROGRAMS}>
          <EnrolledPrograms />
        </div>
      </div>
    </div>
  );
};

export default Programs;
