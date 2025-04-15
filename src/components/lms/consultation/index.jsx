'use client';
import { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ConsultationsLibrary from './ConsultationsLibrary';
import EnrolledConsultations from './EnrolledConsultations';

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
        <Tab value={TABS.LIBRARY} label="Library" className='!capitalize' />
        <Tab value={TABS.ENROLLED_CONSULTATIONS} label="Enrolled Consultations" className='!capitalize'/>
      </Tabs>
      <div className="py-5">
        {/* Tabs Content */}
        <div hidden={selectedTab !== TABS.LIBRARY}>
          <ConsultationsLibrary />
        </div>
        <div hidden={selectedTab !== TABS.ENROLLED_CONSULTATIONS}>
          <EnrolledConsultations />
        </div>
      </div>
    </div>
  );
};

export default PersonalConsultation;
