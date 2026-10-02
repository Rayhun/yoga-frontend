'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik, Form } from 'formik';
import { toast } from 'react-toastify';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import Button from '@/components/common/Button';
import { PageHeader } from '@/components/common/page';
import { getHomeCardsConfig, updateHomeCardsConfig } from '@/services/private/lms/home-cards';
import queryKeys from '@/utils/query-keys';
import { toastApiError } from '@/utils/helpers';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';

const SHARED_FIELDS = [
  { name: 'shared.is_period_section', label: 'Period Section' },
  { name: 'shared.is_checkin_section', label: 'Check-in Section' },
  { name: 'shared.is_coach_section', label: 'Coach Section' },
  { name: 'shared.is_wearable_section', label: 'Wearable Section' },
  { name: 'shared.is_wearable_info', label: 'Wearable Info' },
  { name: 'shared.is_info_section', label: 'Info Section' },
];

const NEW_USER_SECTION_FIELDS = [
  { name: 'new_user.is_checkin_info', label: 'Check-in Info' },
  { name: 'new_user.is_getting_started_section', label: 'Getting Started' },
  { name: 'new_user.is_auto_tracker_section', label: 'Auto Tracker' },
  { name: 'new_user.is_feature_section', label: 'Feature Section' },
  { name: 'new_user.is_personalized_section', label: 'Personalized Section' },
  { name: 'new_user.is_scored_section', label: 'Scored Section' },
  { name: 'new_user.is_today_plan_section', label: 'Today Plan Section' },
  { name: 'new_user.is_progress_section', label: 'Progress Section' },
  { name: 'new_user.is_program_section', label: 'Program Section' },
  { name: 'new_user.is_explore_section', label: 'Explore Section' },
  { name: 'new_user.is_trend_section', label: 'Trend Section' },
  { name: 'new_user.is_quick_relief_section', label: 'Quick Relief Section' },
  { name: 'new_user.is_header_chip', label: 'Header Chip' },
  { name: 'new_user.is_ai_btn', label: 'AI Button' },
];

const RETURNING_USER_SECTION_FIELDS = [
  { name: 'returning_user.is_checkin_info', label: 'Check-in Info' },
  { name: 'returning_user.is_getting_started_section', label: 'Getting Started' },
  { name: 'returning_user.is_auto_tracker_section', label: 'Auto Tracker' },
  { name: 'returning_user.is_feature_section', label: 'Feature Section' },
  { name: 'returning_user.is_personalized_section', label: 'Personalized Section' },
  { name: 'returning_user.is_scored_section', label: 'Scored Section' },
  { name: 'returning_user.is_today_plan_section', label: 'Today Plan Section' },
  { name: 'returning_user.is_progress_section', label: 'Progress Section' },
  { name: 'returning_user.is_explore_section', label: 'Explore Section' },
  { name: 'returning_user.is_trend_section', label: 'Trend Section' },
  { name: 'returning_user.is_quick_relief_section', label: 'Quick Relief Section' },
  { name: 'returning_user.is_header_chip', label: 'Header Chip' },
  { name: 'returning_user.is_ai_btn', label: 'AI Button' },
];

const TABS = [
  { id: 'shared', label: 'Shared Sections' },
  { id: 'new_user', label: 'New User' },
  { id: 'returning_user', label: 'Returning User' },
];

const DEFAULT_CONFIG = {
  shared: {
    is_period_section: true,
    is_checkin_section: true,
    is_coach_section: true,
    is_wearable_section: false,
    is_wearable_info: false,
    is_info_section: true,
  },
  new_user: {
    subheading: '',
    sections_order: [],
    info_section_text: '',
    info_section_btn_text: '',
    is_header_chip: false,
    is_ai_btn: false,
    is_checkin_info: true,
    is_getting_started_section: true,
    is_auto_tracker_section: true,
    is_feature_section: true,
    is_personalized_section: false,
    is_scored_section: false,
    is_today_plan_section: false,
    is_progress_section: false,
    is_program_section: false,
    is_explore_section: false,
    is_trend_section: false,
    is_quick_relief_section: false,
  },
  returning_user: {
    subheading: '',
    sections_order: [],
    footer_note: '',
    ai_button_label: 'Ask AI',
    ai_button_icon: 'sparkle',
    info_section_text: '',
    info_section_btn_text: '',
    is_header_chip: true,
    is_ai_btn: true,
    is_checkin_info: false,
    is_getting_started_section: false,
    is_auto_tracker_section: false,
    is_feature_section: false,
    is_personalized_section: true,
    is_scored_section: true,
    is_today_plan_section: true,
    is_progress_section: true,
    is_explore_section: true,
    is_trend_section: false,
    is_quick_relief_section: true,
  },
};

const parseSectionsOrder = value =>
  (value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

const formatSectionsOrder = value => (Array.isArray(value) ? value.join(', ') : '');

const mapConfigToFormValues = config => {
  const merged = {
    ...DEFAULT_CONFIG,
    ...config,
    shared: { ...DEFAULT_CONFIG.shared, ...(config?.shared || {}) },
    new_user: { ...DEFAULT_CONFIG.new_user, ...(config?.new_user || {}) },
    returning_user: { ...DEFAULT_CONFIG.returning_user, ...(config?.returning_user || {}) },
  };

  return {
    shared: merged.shared,
    new_user: {
      ...merged.new_user,
      sections_order: formatSectionsOrder(merged.new_user.sections_order),
    },
    returning_user: {
      ...merged.returning_user,
      sections_order: formatSectionsOrder(merged.returning_user.sections_order),
    },
  };
};

const mapFormValuesToConfig = values => ({
  shared: values.shared,
  new_user: {
    ...values.new_user,
    sections_order: parseSectionsOrder(values.new_user.sections_order),
  },
  returning_user: {
    ...values.returning_user,
    sections_order: parseSectionsOrder(values.returning_user.sections_order),
  },
});

const SwitchGrid = ({ fields }) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
    {fields.map(field => (
      <FormikSwitch key={field.name} name={field.name} label={field.label} />
    ))}
  </div>
);

const HomeCards = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('shared');

  const { data: response, isLoading, failureReason } = useQuery({
    queryFn: getHomeCardsConfig,
    queryKey: [queryKeys.homeCardsConfig],
  });

  useHandleApiResponse(failureReason);

  const initialValues = useMemo(
    () => mapConfigToFormValues(response?.data?.data?.config),
    [response?.data?.data?.config]
  );

  const { mutateAsync: saveConfig } = useMutation({
    mutationFn: updateHomeCardsConfig,
    onSuccess: async () => {
      await queryClient.invalidateQueries([queryKeys.homeCardsConfig]);
      toast.success('Home cards configuration saved successfully');
    },
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await saveConfig({ config: mapFormValuesToConfig(values) });
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Home Cards" />
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Home Cards" />

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'shared' && (
              <FormLayoutWrapper title="Shared Home Sections">
                <SwitchGrid fields={SHARED_FIELDS} />
              </FormLayoutWrapper>
            )}

            {activeTab === 'new_user' && (
              <FormLayoutWrapper title="New User Home Cards">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <FormikField name="new_user.subheading" label="Subheading" />
                    <FormikField
                      name="new_user.sections_order"
                      label="Sections Order"
                      helperIcon={
                        <span className="text-xs text-gray-500">Comma-separated section keys</span>
                      }
                    />
                    <FormikField name="new_user.info_section_text" label="Info Section Text" />
                    <FormikField name="new_user.info_section_btn_text" label="Info Section Button Text" />
                  </div>
                  <SwitchGrid fields={NEW_USER_SECTION_FIELDS} />
                </div>
              </FormLayoutWrapper>
            )}

            {activeTab === 'returning_user' && (
              <FormLayoutWrapper title="Returning User Home Cards">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <FormikField name="returning_user.subheading" label="Subheading" />
                    <FormikField name="returning_user.footer_note" label="Footer Note" />
                    <FormikField
                      name="returning_user.sections_order"
                      label="Sections Order"
                      helperIcon={
                        <span className="text-xs text-gray-500">Comma-separated section keys</span>
                      }
                    />
                    <FormikField name="returning_user.ai_button_label" label="AI Button Label" />
                    <FormikField name="returning_user.ai_button_icon" label="AI Button Icon" />
                    <FormikField name="returning_user.info_section_text" label="Info Section Text" />
                    <FormikField
                      name="returning_user.info_section_btn_text"
                      label="Info Section Button Text"
                    />
                  </div>
                  <SwitchGrid fields={RETURNING_USER_SECTION_FIELDS} />
                </div>
              </FormLayoutWrapper>
            )}

            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default HomeCards;
