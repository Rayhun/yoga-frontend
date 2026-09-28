'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import queryKeys from '@/utils/query-keys';
import PageLoader from '@/components/common/loader/PageLoader';
import { MdOutlineArrowBack, MdOutlineRemoveRedEye } from 'react-icons/md';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import {
  createProgram,
  getProgram,
  publishProgram,
  updateProgramBasics,
  updateProgramCertificateSetup,
  updateProgramDelivery,
  updateProgramModules,
  updateProgramPricing,
} from '@/services/private/certification/program';
import ProgramBasicsSection from '@/components/certification/builder/sections/ProgramBasicsSection';
import DeliveryFormatSection from '@/components/certification/builder/sections/DeliveryFormatSection';
import CurriculumBuilderSection from '@/components/certification/builder/sections/CurriculumBuilderSection';
import PricingSection from '@/components/certification/builder/sections/PricingSection';
import CertificateSetupSection from '@/components/certification/builder/sections/CertificateSetupSection';
import PublishSection from '@/components/certification/builder/sections/PublishSection';
import { toLessonFormValues, toModuleFormValues } from '@/components/certification/builder/sections/curriculumFields';
import BuilderStepper from '@/components/certification/builder/BuilderStepper';
import BuilderTabs from '@/components/certification/builder/BuilderTabs';
import SaveStatusIndicator from '@/components/certification/builder/SaveStatusIndicator';
import ProgramPreviewPopup from '@/components/certification/builder/ProgramPreviewPopup';
import { getPublishBlockers } from '@/components/certification/builder/publish/readiness';

const STEP_PANEL_IDS = { 1: 'builder-step-basics', 2: 'builder-step-content' };

// Step 2's tabs; `blockerId` is the readiness check that decides the tab's ✓ / ⚠ marker.
const TABS = [
  { id: 'curriculum', label: 'Curriculum', blockerId: 'curriculum' },
  { id: 'pricing', label: 'Pricing', blockerId: 'pricing' },
  { id: 'certificate', label: 'Certificate', blockerId: 'certificate_setup' },
  { id: 'publish', label: 'Publish' },
];
const tabPanelId = tabId => `builder-tab-${tabId}`;

// Every autosaving section: its name in the global save status, and where it lives.
const SECTIONS = {
  basics: { label: 'Program Basics', step: 1 },
  delivery: { label: 'Delivery Format', step: 1 },
  curriculum: { label: 'Curriculum', step: 2, tab: 'curriculum' },
  pricing: { label: 'Pricing', step: 2, tab: 'pricing' },
  certificate: { label: 'Certificate Setup', step: 2, tab: 'certificate' },
};
const sectionAnchorId = sectionId => `builder-section-${sectionId}`;

// Every tab panel stays mounted; inactive ones are only hidden (CSS), never unmounted.
const TabPanel = ({ id, activeTab, children }) => (
  <div id={tabPanelId(id)} role="tabpanel" aria-labelledby={`${tabPanelId(id)}-tab`} className={id === activeTab ? '' : 'hidden'}>
    {children}
  </div>
);

const BLANK_BASICS = {
  title: '',
  short_description: '',
  category: null,
  duration_estimate: '',
  target_audience: 'both',
  thumbnail: null,
  subtitle: '',
  full_description: '',
  level: null,
  language: '',
  promo_video: '',
  outcomes: '',
  start_date: '',
  time_zone: '',
  event_type: '',
  is_online: true,
  meeting_link: '',
  venue_location: '',
  is_recurring: false,
  recurring_dates: [],
  followup_support: [],
};

const pickBasics = program => ({
  title: program?.title ?? '',
  short_description: program?.short_description ?? '',
  category: program?.category ?? null,
  duration_estimate: program?.duration_estimate ?? '',
  target_audience: program?.target_audience ?? 'both',
  thumbnail: program?.thumbnail ?? null,
  subtitle: program?.subtitle ?? '',
  full_description: program?.full_description ?? '',
  level: program?.level ?? null,
  language: program?.language ?? '',
  promo_video: program?.promo_video ?? '',
  outcomes: program?.outcomes ?? '',
  start_date: program?.start_date ?? '',
  time_zone: program?.time_zone ?? '',
  event_type: program?.event_type ?? '',
  is_online: program?.is_online ?? true,
  meeting_link: program?.meeting_link ?? '',
  venue_location: program?.venue_location ?? '',
  is_recurring: program?.is_recurring ?? false,
  recurring_dates: Array.isArray(program?.recurring_dates) ? program.recurring_dates : [],
  // Stored server-side as a comma-joined CharField (mirrors LMS.Event.followup_support) —
  // FormikMultiSelect needs an array either way.
  followup_support: program?.followup_support
    ? (Array.isArray(program.followup_support) ? program.followup_support : program.followup_support.split(','))
    : [],
  tags: Array.isArray(program?.tags) ? program.tags : [],
});

const pickDelivery = program => ({
  delivery_format: program?.delivery_format ?? null,
  platform_name: program?.platform_name ?? '',
});

// `id` is sent back on save so the modules PUT updates in place instead of recreating (which
// would lose learner progress). `_key` is UI-only identity (see CurriculumBuilderSection).
const pickModules = program => ({
  modules: (program?.modules || []).map(module => ({
    ...toModuleFormValues(module),
    lessons: (module.lessons || []).map(toLessonFormValues),
  })),
});

const pickPricing = program => ({
  payment_type: program?.payment_type ?? 'one_time',
  price: program?.price ?? '',
  seat_limit: program?.seat_limit ?? '',
});

const pickCertificateSetup = program => ({
  certificate_title: program?.certificate_setting?.certificate_title ?? '',
  expiry_period_days: program?.certificate_setting?.expiry_period_days ?? '',
  completion_rules: program?.certificate_setting?.completion_rules ?? '',
  // Defaults to the creator's own name (server-resolved — Expert.public_name or
  // Institution.legal_organization_name, see ProgramDetailSerializer.get_creator_display_name)
  // only when nothing's been explicitly saved for this field yet; stays freely editable either way.
  primary_issuer_name: program?.certificate_setting?.primary_issuer_name ?? program?.creator_display_name ?? '',
});

/**
 * Two-step wizard (KAN-121) inside one LMS-style card (FormLayoutWrapper): a clickable stepper and
 * the global save status sit in the card header. Step 1 is Basics plus the Delivery section (shown
 * under "Schedule & format" but still its own form/autosave), gated behind "Continue"; Step 2 is
 * tabbed: Curriculum · Pricing · Certificate · Publish. Every section still shares the same
 * {initialValues, onSave, disabled} → status contract via useSectionAutosave — the stepper and tabs
 * only change navigation, not save mechanics. Each section reports its status up
 * (`onStatusChange`) for the header summary.
 *
 * Both steps and every tab stay MOUNTED; inactive ones are only hidden with CSS. Unmounting would
 * drop a section's Formik values — including values whose save just failed, which the autosave
 * hook only re-sends on unmount while a debounce timer is still pending.
 *
 * This file is mostly wiring: each handle*Save calls its endpoint, then invalidates the shared
 * program-detail query so every other section (and Publish's readiness view) stays in sync.
 *
 * ``programId`` is the route param — either an existing program's id, or the literal string
 * 'new'. On 'new', only Basics renders and Step 2 is disabled (nothing else can attach without an
 * id yet); the first successful Basics save creates the draft and replaces the URL with the real
 * id. Resuming an existing program (``routeParam !== 'new'``) defaults straight to Step 2.
 */
const ProgramBuilderModal = ({ programId: routeParam }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [liveId, setLiveId] = useState(routeParam === 'new' ? null : routeParam);
  const [currentStep, setCurrentStep] = useState(routeParam === 'new' ? 1 : 2);
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [sectionStatuses, setSectionStatuses] = useState({});
  const [isContinuing, setIsContinuing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const basicsFormRef = useRef(null);

  const { data: programRes, isLoading } = useQuery({
    queryKey: [queryKeys.certificationProgramDetail, liveId],
    queryFn: () => getProgram({ id: liveId }),
    enabled: !!liveId,
  });
  const program = programRes?.data;

  const invalidateProgram = useCallback(
    () => queryClient.invalidateQueries([queryKeys.certificationProgramDetail, liveId]),
    [queryClient, liveId]
  );

  const handleBasicsSave = useCallback(
    async values => {
      if (!liveId) {
        const { data: created } = await createProgram({ payload: { title: values.title } });
        // Immediately follow with a full Basics PATCH so any other fields already filled in
        // before this very first save (e.g. typed within the same debounce window as the
        // title) aren't silently dropped by the create endpoint's title-only shape.
        const { data: updated } = await updateProgramBasics({ id: created.id, payload: values });
        queryClient.setQueryData([queryKeys.certificationProgramDetail, created.id], { data: updated });
        setLiveId(created.id);
        // Use the current pathname to preserve whether we're in /portal/teacher/... or /portal/institution/...
        const basePath = window.location.pathname.replace('/new', '');
        router.replace(`${basePath}/${created.id}`);
        return updated;
      }
      const { data } = await updateProgramBasics({ id: liveId, payload: values });
      await invalidateProgram();
      return data;
    },
    [liveId, router, queryClient, invalidateProgram]
  );

  const handleDeliverySave = useCallback(
    async values => {
      const { data } = await updateProgramDelivery({ id: liveId, payload: values });
      await invalidateProgram();
      return data;
    },
    [liveId, invalidateProgram]
  );

  const handleModulesSave = useCallback(
    async values => {
      const { data } = await updateProgramModules({ id: liveId, payload: values });
      await invalidateProgram();
      return data;
    },
    [liveId, invalidateProgram]
  );

  const handlePricingSave = useCallback(
    async values => {
      const { data } = await updateProgramPricing({ id: liveId, payload: values });
      await invalidateProgram();
      return data;
    },
    [liveId, invalidateProgram]
  );

  const handleCertificateSetupSave = useCallback(
    async values => {
      const { data } = await updateProgramCertificateSetup({ id: liveId, payload: values });
      await invalidateProgram();
      return data;
    },
    [liveId, invalidateProgram]
  );

  const handlePublish = useCallback(
    async nextStatus => {
      try {
        await publishProgram({ id: liveId, payload: { status: nextStatus } });
      } finally {
        await invalidateProgram();
      }
    },
    [liveId, invalidateProgram]
  );

  const basicsInitialValues = useMemo(() => (program ? pickBasics(program) : BLANK_BASICS), [program]);
  const deliveryInitialValues = useMemo(() => pickDelivery(program), [program]);
  const modulesInitialValues = useMemo(() => pickModules(program), [program]);
  const pricingInitialValues = useMemo(() => pickPricing(program), [program]);
  const certificateSetupInitialValues = useMemo(() => pickCertificateSetup(program), [program]);

  const isProgramMissing = Boolean(liveId) && !isLoading && !program;
  // Side effect in an effect, not during render (a toast from render fires on every re-render).
  useEffect(() => {
    if (isProgramMissing) toast.error('Program not found.');
  }, [isProgramMissing]);

  const statusReporters = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(SECTIONS).map(id => [id, next => setSectionStatuses(previous => ({ ...previous, [id]: next }))])
      ),
    []
  );

  // Switch to wherever `sectionId` lives (step, and tab on Step 2), then bring its heading into view.
  // Panels are only hidden, never unmounted, so the element is already there once it's shown.
  const showSection = useCallback(sectionId => {
    const { step, tab } = SECTIONS[sectionId];
    setCurrentStep(step);
    if (tab) setActiveTab(tab);
    setTimeout(() => {
      const anchor = document.getElementById(sectionAnchorId(sectionId));
      anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById(`${sectionAnchorId(sectionId)}-title`)?.focus({ preventScroll: true });
    }, 0);
  }, []);

  const handleContinue = useCallback(async () => {
    setIsContinuing(true);
    try {
      // Basics' own submit: validates, flushes its pending autosave, then onContinue → Step 2.
      await basicsFormRef.current?.submitForm();
    } finally {
      setIsContinuing(false);
    }
  }, []);

  const blockers = useMemo(() => (program ? getPublishBlockers(program) : []), [program]);
  const isBlockerOk = id => blockers.find(check => check.id === id)?.ok;

  const saveStatusSections = Object.entries(SECTIONS).map(([id, { label }]) => ({
    id,
    label,
    ...sectionStatuses[id],
  }));
  const tabMarker = (tabId, blockerId) => {
    const failed = Object.entries(SECTIONS).some(([id, section]) => section.tab === tabId && sectionStatuses[id]?.status === 'error');
    if (failed) return 'error';
    if (!blockerId) return null;
    return isBlockerOk(blockerId) ? 'ok' : 'warn';
  };

  if (liveId && isLoading && !program) {
    return <PageLoader />;
  }

  if (liveId && !program) {
    return <p className="text-gray-500">Program not found.</p>;
  }

  const steps = [
    { id: 1, label: 'Basics', panelId: STEP_PANEL_IDS[1], done: Boolean(liveId) && isBlockerOk('basics') && isBlockerOk('delivery') },
    {
      id: 2,
      label: 'Content & Publish',
      panelId: STEP_PANEL_IDS[2],
      disabled: !liveId,
      disabledReason: 'Give the program a title first',
    },
  ];

  const tabs = TABS.map(tab => ({ ...tab, panelId: tabPanelId(tab.id), marker: tabMarker(tab.id, tab.blockerId) }));

  const headerActions = [
    { id: 'back', variant: 'secondary', onClick: () => router.back(), label: 'Back', Icon: MdOutlineArrowBack },
    {
      id: 'preview',
      variant: 'secondary',
      onClick: () => setIsPreviewOpen(true),
      label: 'Preview',
      Icon: MdOutlineRemoveRedEye,
      disabled: !program,
    },
  ];

  return (
    <div>
      <PageHeader title="Program Builder">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>

      <FormLayoutWrapper
        headerContent={<BuilderStepper steps={steps} currentStep={currentStep} onSelect={setCurrentStep} />}
        headerAside={<SaveStatusIndicator sections={saveStatusSections} onShowSection={showSection} />}
      >
        <div
          id={STEP_PANEL_IDS[1]}
          role="tabpanel"
          aria-labelledby={`${STEP_PANEL_IDS[1]}-tab`}
          className={currentStep === 1 ? 'flex flex-col gap-8' : 'hidden'}
        >
          <ProgramBasicsSection
            key={`basics-${liveId ?? 'new'}`}
            anchorId={sectionAnchorId('basics')}
            initialValues={basicsInitialValues}
            onSave={handleBasicsSave}
            onContinue={() => setCurrentStep(2)}
            formRef={basicsFormRef}
            onStatusChange={statusReporters.basics}
          />
          {liveId ? (
            <DeliveryFormatSection
              key={`delivery-${liveId}`}
              anchorId={sectionAnchorId('delivery')}
              initialValues={deliveryInitialValues}
              onSave={handleDeliverySave}
              onStatusChange={statusReporters.delivery}
            />
          ) : null}
          <div className="flex justify-end border-t border-stroke pt-4 dark:border-strokedark">
            <Button type="button" size="2xl" isLoading={isContinuing} onClick={handleContinue}>
              Continue to Content &amp; Publish →
            </Button>
          </div>
        </div>

        {liveId ? (
          <div
            id={STEP_PANEL_IDS[2]}
            role="tabpanel"
            aria-labelledby={`${STEP_PANEL_IDS[2]}-tab`}
            className={currentStep === 2 ? 'flex flex-col gap-6' : 'hidden'}
          >
            <BuilderTabs tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
            <TabPanel id="curriculum" activeTab={activeTab}>
              <CurriculumBuilderSection
                key={`curriculum-${liveId}`}
                anchorId={sectionAnchorId('curriculum')}
                initialValues={modulesInitialValues}
                onSave={handleModulesSave}
                onStatusChange={statusReporters.curriculum}
              />
            </TabPanel>
            <TabPanel id="pricing" activeTab={activeTab}>
              <PricingSection
                key={`pricing-${liveId}`}
                anchorId={sectionAnchorId('pricing')}
                initialValues={pricingInitialValues}
                onSave={handlePricingSave}
                onStatusChange={statusReporters.pricing}
              />
            </TabPanel>
            <TabPanel id="certificate" activeTab={activeTab}>
              <CertificateSetupSection
                key={`certificate-setup-${liveId}`}
                anchorId={sectionAnchorId('certificate')}
                initialValues={certificateSetupInitialValues}
                onSave={handleCertificateSetupSave}
                onStatusChange={statusReporters.certificate}
              />
            </TabPanel>
            <TabPanel id="publish" activeTab={activeTab}>
              <PublishSection anchorId={sectionAnchorId('publish')} currentStatus={program.status} onPublish={handlePublish} />
            </TabPanel>
          </div>
        ) : null}
      </FormLayoutWrapper>

      <ProgramPreviewPopup open={isPreviewOpen} program={program} onClose={() => setIsPreviewOpen(false)} />
    </div>
  );
};

export default ProgramBuilderModal;
