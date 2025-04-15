'use client';
import { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ConsultationsLibrary from './ConsultationsLibrary';

const TABS = {
  LIBRARY: 'library',
  ENROLLED_CONSULTATIONS: 'enrolled-consultations',
};

const PersonalConsultation = () => {
  const [selectedTab, setSelectedTab] = useState(TABS.LIBRARY);

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div>
      {/* Tabs */}
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab value={TABS.LIBRARY} label="Library" />
        <Tab value={TABS.ENROLLED_CONSULTATIONS} disabled label="Enrolled Consultations" />
      </Tabs>
      <div className="py-5">
        {/* Tabs Content */}
        <div hidden={selectedTab !== TABS.LIBRARY}>
          <ConsultationsLibrary />
        </div>
        <div hidden={selectedTab !== TABS.ENROLLED_CONSULTATIONS}>
          <h1>My Coachings</h1>
        </div>
      </div>
    </div>
  );
};

export default PersonalConsultation;
