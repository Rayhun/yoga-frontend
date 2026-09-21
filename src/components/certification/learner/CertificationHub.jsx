'use client';
import { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import EnrolledCertifications from './EnrolledCertifications';
import DiscoverPanel from './DiscoverPanel';

const TABS = {
  MY_CERTIFICATIONS: 'my-certifications',
  LIBRARY: 'library',
};

const CertificationHub = () => {
  const [selectedTab, setSelectedTab] = useState(TABS.MY_CERTIFICATIONS);

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div>
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab value={TABS.MY_CERTIFICATIONS} label="My Certifications" />
        <Tab value={TABS.LIBRARY} label="Library" />
      </Tabs>
      <div className="py-5">
        <div hidden={selectedTab !== TABS.LIBRARY}>
          <DiscoverPanel />
        </div>
        <div hidden={selectedTab !== TABS.MY_CERTIFICATIONS}>
          <EnrolledCertifications />
        </div>
      </div>
    </div>
  );
};

export default CertificationHub;
