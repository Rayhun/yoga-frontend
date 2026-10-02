'use client';

import { useMemo, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikEmailField from '@/components/common/form/formik/FormikEmailField';
import FormikPhoneFieldWithValidation from '@/components/common/form/formik/FormikPhoneFieldWithValidation';
import {
  getDefaultRegistrationTab,
  getVisibleRegistrationTabs,
} from './onboardUtils';
import {
  ONBOARD_PRIMARY_BUTTON_CLASS,
  ONBOARD_SUBTITLE_CLASS,
  ONBOARD_TITLE_CLASS,
} from './onboardStyles';

const buildValidationSchema = (fields = []) => {
  const shape = {};

  fields.forEach(field => {
    if (field.id === 'user_email_address') {
      shape[field.id] = Yup.string()
        .trim()
        .lowercase()
        .email('Please enter a valid email')
        .required('Required!');
      return;
    }

    if (field.id === 'user_phone_number') {
      shape[field.id] = Yup.string()
        .min(10, 'Please enter a valid phone number')
        .required('Required!');
      return;
    }

    shape[field.id] = field.required
      ? Yup.string().trim().required('Required!')
      : Yup.string().trim();
  });

  return Yup.object(shape);
};

const buildInitialValues = (fields = []) =>
  fields.reduce((acc, field) => {
    acc[field.id] = '';
    return acc;
  }, {});

const JoinOnboardStep1 = ({ stepData, onSubmit, isSubmitting }) => {
  const visibleTabs = useMemo(
    () => getVisibleRegistrationTabs(stepData?.registration_tabs),
    [stepData?.registration_tabs]
  );
  const [activeTab, setActiveTab] = useState(() =>
    getDefaultRegistrationTab(stepData?.registration_tabs)
  );

  const showTabs = visibleTabs.length > 1;
  const activeFields =
    activeTab === 'phone' ? stepData?.phone_form_fields : stepData?.email_form_fields;

  const validationSchema = useMemo(
    () => buildValidationSchema(activeFields),
    [activeFields]
  );
  const initialValues = useMemo(() => buildInitialValues(activeFields), [activeFields]);

  const renderField = field => {
    if (field.id === 'user_email_address' || field.type === 'email') {
      return (
        <FormikEmailField
          key={field.id}
          name={field.id}
          label={field.label}
          placeholder={field.placeholder}
          required={field.required}
        />
      );
    }

    if (field.id === 'user_phone_number' || field.type === 'number') {
      return (
        <FormikPhoneFieldWithValidation
          key={field.id}
          name={field.id}
          label={field.label}
          placeholder={field.placeholder}
          required={field.required}
        />
      );
    }

    return (
      <FormikField
        key={field.id}
        name={field.id}
        label={field.label}
        placeholder={field.placeholder}
        required={field.required}
      />
    );
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="mb-6 sm:mb-8">
        <h1 className={ONBOARD_TITLE_CLASS}>{stepData?.header?.title}</h1>
        {stepData?.header?.subtitle ? (
          <p className={ONBOARD_SUBTITLE_CLASS}>{stepData.header.subtitle}</p>
        ) : null}
      </div>

      {showTabs ? (
        <div className="mb-5 flex rounded-full bg-[#E8F0E8] p-1 sm:mb-6">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#1E4D35] shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={values => onSubmit({ values, activeTab })}
      >
        {({ isSubmitting: formSubmitting }) => (
          <Form className="flex flex-1 flex-col">
            <div className="space-y-5">
              {activeFields?.map(renderField)}

              {stepData?.privacy_note?.text ? (
                <div className="rounded-xl border border-[#C8E6D4] bg-[#F0F7F2] px-4 py-3.5 text-sm leading-relaxed text-[#3D5C48]">
                  {stepData.privacy_note.icon ? (
                    <span className="mr-1.5">{stepData.privacy_note.icon}</span>
                  ) : null}
                  {stepData.privacy_note.text}
                </div>
              ) : null}
            </div>

            <div className="mt-auto space-y-3 pt-8 sm:pt-10">
              <button
                type="submit"
                disabled={isSubmitting || formSubmitting}
                className={ONBOARD_PRIMARY_BUTTON_CLASS}
              >
                {isSubmitting || formSubmitting
                  ? 'Continuing...'
                  : stepData?.footer_actions?.primary_button?.label || 'Continue'}
              </button>

              {stepData?.footer_actions?.legal_disclaimer ? (
                <p className="text-center text-xs leading-relaxed text-gray-400">
                  {stepData.footer_actions.legal_disclaimer}
                </p>
              ) : null}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default JoinOnboardStep1;
