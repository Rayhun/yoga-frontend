'use client';

import { useMemo } from 'react';
import CommunityDetailHeader from './CommunityDetailHeader';
import CommunityInfoBanner from './CommunityInfoBanner';
import CommunityPageSection from './CommunityPageSection';

const CommunityDetailView = ({ pageData }) => {
  const sections = pageData?.sections || [];

  const sortedSections = useMemo(
    () =>
      [...sections].sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
      ),
    [sections]
  );

  if (!pageData) return null;

  return (
    <div className="w-full space-y-6">
      <CommunityDetailHeader header={pageData.header} />

      {pageData.info_banner ? (
        <CommunityInfoBanner banner={pageData.info_banner} />
      ) : null}

      {sortedSections.map(section => (
        <CommunityPageSection
          key={section.section_id || section.card_type}
          section={section}
        />
      ))}
    </div>
  );
};

export default CommunityDetailView;
