'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FaFilter } from 'react-icons/fa';
import useToggle from '@/hooks/useToggle';
import useAuthContext from '@/hooks/useAuthContext';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Popup from '@/components/common/popup';
import FeaturedCategories from '@/components/lms/category/FeaturedCategories';
import CertificationLibraryFilter from './CertificationLibraryFilter';
import CatalogSection from './CatalogSection';
import TrackFilterPills from './TrackFilterPills';
import {
  TRACK_TYPE_PARAM,
  buildCatalogParams,
  parseTrackType,
  selectActiveTracks,
  selectCatalogPrograms,
} from './catalogModel';
import { getCertificationCatalog, getEnrolledCertifications } from '@/services/private/certification/catalog';
import queryKeys from '@/utils/query-keys';

const catalogPrograms = response => response?.data?.results?.data?.['all-programs'] || [];

const DiscoverPanel = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamUtils = useSearchParamUtils();
  const { user } = useAuthContext();
  const isSignedIn = Boolean(user?.email);
  const enrolledProgramId = searchParams.get('enrolled');

  const { isOpen: isFilterModalOpen, toggle: toggleFilterModal } = useToggle();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});

  const selectedTag = searchParamUtils.get('tags') || '';
  // The pill selection lives in the URL (?track_type=clinical) so it survives a reload and can be shared.
  const trackType = parseTrackType(searchParamUtils.get(TRACK_TYPE_PARAM));

  const allParams = useMemo(
    () => buildCatalogParams({ trackType, filters, tag: selectedTag }),
    [trackType, filters, selectedTag]
  );
  const recommendedParams = useMemo(
    () => buildCatalogParams({ trackType, filters, tag: selectedTag, recommended: true }),
    [trackType, filters, selectedTag]
  );

  const { isFetching, data: response } = useQuery({
    queryFn: () => getCertificationCatalog(allParams),
    queryKey: [queryKeys.certificationCatalog, JSON.stringify(allParams)],
  });
  const { isFetching: isFetchingRecommended, data: recommendedResponse } = useQuery({
    queryFn: () => getCertificationCatalog(recommendedParams),
    queryKey: [queryKeys.certificationCatalog, JSON.stringify(recommendedParams)],
  });
  // Existing endpoint, same one My Certifications uses; only asked for when signed in.
  const { data: activeResponse } = useQuery({
    queryFn: () => getEnrolledCertifications({ status: 'InProgress' }),
    queryKey: [queryKeys.certificationEnrolledCertifications, 'InProgress'],
    enabled: isSignedIn,
  });

  const allPrograms = useMemo(() => selectCatalogPrograms(catalogPrograms(response), searchText), [response, searchText]);
  const recommendedPrograms = useMemo(
    () => selectCatalogPrograms(catalogPrograms(recommendedResponse), searchText),
    [recommendedResponse, searchText]
  );
  const activeTracks = useMemo(
    () =>
      isSignedIn
        ? selectActiveTracks(catalogPrograms(activeResponse), {
            searchText,
            // The enrolled endpoint has no track_type filter: under a pill, keep only what the filtered catalog returned.
            catalogIds: trackType ? new Set(catalogPrograms(response).map(program => program.id)) : null,
          })
        : [],
    [isSignedIn, activeResponse, response, searchText, trackType]
  );

  const apiCategories = response?.data?.results?.data?.categories ?? [];
  const apiTags = response?.data?.results?.data?.tags ?? [];
  const tags = useMemo(() => apiTags.map(name => ({ id: name, name })), [apiTags]);

  const handleApplyFilter = values => {
    setFilters(values);
    toggleFilterModal(false);
  };

  const handleSelectFeaturedTag = selected => {
    if (selectedTag === (selected?.name ?? selected?.id)) {
      searchParamUtils.remove('tags');
    } else {
      searchParamUtils.set('tags', selected?.name ?? selected?.id ?? '');
    }
  };

  const handleSelectTrackType = value => searchParamUtils.set(TRACK_TYPE_PARAM, value);
  const openProgram = program => router.push(`/portal/customer/certification/${program.id}`);
  const isRefined = Boolean(searchText || selectedTag || trackType);

  return (
    <div className="flex flex-col gap-4 md:gap-7">
      {enrolledProgramId && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center justify-between">
          {"You're enrolled! Head to My Certifications to get started."}
          <button onClick={() => router.replace('/portal/customer/certification')} className="text-green-500 hover:text-green-700">
            &times;
          </button>
        </div>
      )}

      <Popup heading="Certification Filters" open={isFilterModalOpen} onClose={() => toggleFilterModal()}>
        <CertificationLibraryFilter
          filters={filters}
          onApplyFilter={handleApplyFilter}
          categoryOptions={apiCategories.map(name => ({ label: name, value: name }))}
          tagOptions={apiTags.map(name => ({ label: name, value: name }))}
        />
      </Popup>

      {/* Header */}
      <div className="bg-white text-gray-800 portal-hero rounded-2xl shadow-2xl mb-2 md:mb-4 relative overflow-hidden border border-gray-100">
        <div className="relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-800 rounded-sm rotate-45 flex items-center justify-center">
                <svg className="w-4 h-4 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Professional Tracks</h1>
                <p className="text-gray-600 text-sm">Explore accredited learning tracks, elevate your practice, and earn recognized credentials in specialized health and wellness.</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 aspect-[16/9]">
            <div className="relative">
              <Image
                src="/images/content/Wellness_program.png"
                alt="Hero Image"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-white flex flex-col gap-6 rounded-lg shadow-md">
        {/* Filter pills (whole page) */}
        <TrackFilterPills selected={trackType} onSelect={handleSelectTrackType} />

        <FeaturedCategories
          categories={tags}
          selected={selectedTag ? [selectedTag] : []}
          onSelect={handleSelectFeaturedTag}
        />

        <div className="portal-search-row">
          <input
            className="portal-search-input rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Search Certifications"
            onChange={e => setSearchText(e.target.value || '')}
          />
          <FaFilter className="cursor-pointer dark:text-white" onClick={() => toggleFilterModal()} />
        </div>

        {/* Signed-in learners with at least one track in progress */}
        {isSignedIn && (
          <CatalogSection
            title="My Active Tracks"
            subtitle="Resume your learning and track your progress toward certification."
            programs={activeTracks}
            hideWhenEmpty
            showProgress
            onOpen={openProgram}
          />
        )}

        <CatalogSection
          title="Recommended Tracks for You"
          subtitle="Expand your skill set with expert-led training designed for your level."
          programs={recommendedPrograms}
          isLoading={isFetchingRecommended && !recommendedResponse}
          hideWhenEmpty
          onOpen={openProgram}
        />

        <CatalogSection
          title="All Tracks"
          programs={allPrograms}
          isLoading={isFetching}
          emptyMessage={isRefined ? 'No tracks found matching your criteria' : 'No tracks are available yet. Please check back soon.'}
          onOpen={openProgram}
        />
      </div>
    </div>
  );
};

export default DiscoverPanel;
