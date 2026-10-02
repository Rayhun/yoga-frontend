'use client';
import { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import DiscoverPanel from './DiscoverPanel';
import MyCertificationsPanel from './MyCertificationsPanel';

const TABS = {
  DISCOVER: 'discover',
  MY_CERTIFICATIONS: 'my-certifications',
};

const CertificationHub = () => {
  const [selectedTab, setSelectedTab] = useState(TABS.DISCOVER);

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div>
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab value={TABS.DISCOVER} label="Discover" />
        <Tab value={TABS.MY_CERTIFICATIONS} label="My Certifications" />
      </Tabs>
      <div className="py-5">
        <div hidden={selectedTab !== TABS.DISCOVER}>
          <DiscoverPanel />
        </div>
        <div hidden={selectedTab !== TABS.MY_CERTIFICATIONS}>
          <MyCertificationsPanel />
        </div>
      </div>
    </div>
  );
};

export default CertificationHub;
