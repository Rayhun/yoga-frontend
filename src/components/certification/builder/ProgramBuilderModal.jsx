'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import queryKeys from '@/utils/query-keys';
import PageLoader from '@/components/common/loader/PageLoader';
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

const pickModules = program => ({
  modules: (program?.modules || []).map(module => ({
    title: module.title || '',
    lessons: (module.lessons || []).map(lesson => ({
      title: lesson.title || '',
      lesson_type: lesson.lesson_type || 'video',
      content_url: lesson.content_url || '',
      text_content: lesson.text_content || '',
    })),
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
 * Two-step wizard (KAN-121) — Step 1 is Program Basics (Workshop/Program-style information,
 * gated behind its own "Continue to Step 2 →" action); Step 2 is the builder's remaining five
 * confirmed sections in order: Delivery, Curriculum, Pricing, Certificate Setup, Publish. Every
 * section still shares the same {initialValues, onSave, disabled} → status contract via
 * useSectionAutosave — the stepper only changes navigation/gating, not save mechanics (KAN-121
 * explicitly keeps `useSectionAutosave` untouched). This file is mostly wiring: each handle*Save
 * calls its endpoint, then invalidates the shared program-detail query so every other section
 * (and Publish's completeness view) stays in sync.
 *
 * ``programId`` is the route param — either an existing program's id, or the literal string
 * 'new'. On 'new', only Step 1 renders (nothing else can attach without an id yet); the first
 * successful Basics save creates the draft and replaces the URL with the real id. Resuming an
 * existing program (``routeParam !== 'new'``) defaults straight to Step 2 — if the program
 * already exists, Step 1 has necessarily already been saved at least once; a "← Back to Step 1"
 * link still lets the creator revisit it.
 */
const ProgramBuilderModal = ({ programId: routeParam }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [liveId, setLiveId] = useState(routeParam === 'new' ? null : routeParam);
  const [currentStep, setCurrentStep] = useState(routeParam === 'new' ? 1 : 2);

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

  const stepHeader = (label, showBack) => (
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      {showBack && (
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to Step 1
        </button>
      )}
    </div>
  );

  if (!liveId) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        {stepHeader('Step 1 of 2 — Program Basics', false)}
        <ProgramBasicsSection initialValues={BLANK_BASICS} onSave={handleBasicsSave} onContinue={() => setCurrentStep(2)} />
      </div>
    );
  }

  if (isLoading && !program) {
    return <PageLoader />;
  }

  if (!program) {
    toast.error('Program not found.');
    return null;
  }

  if (currentStep === 1) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        {stepHeader('Step 1 of 2 — Program Basics', false)}
        <ProgramBasicsSection
          key={`basics-${liveId}`}
          initialValues={basicsInitialValues}
          onSave={handleBasicsSave}
          onContinue={() => setCurrentStep(2)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {stepHeader('Step 2 of 2 — Delivery, Curriculum, Pricing, Certificate & Publish', true)}
      <DeliveryFormatSection key={`delivery-${liveId}`} initialValues={deliveryInitialValues} onSave={handleDeliverySave} />
      <CurriculumBuilderSection key={`curriculum-${liveId}`} initialValues={modulesInitialValues} onSave={handleModulesSave} />
      <PricingSection key={`pricing-${liveId}`} initialValues={pricingInitialValues} onSave={handlePricingSave} />
      <CertificateSetupSection key={`certificate-setup-${liveId}`} initialValues={certificateSetupInitialValues} onSave={handleCertificateSetupSave} />
      <PublishSection currentStatus={program.status} onPublish={handlePublish} />
    </div>
  );
};

export default ProgramBuilderModal;
