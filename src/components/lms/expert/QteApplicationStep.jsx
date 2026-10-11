'use client';
import { useCallback, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { FiAward, FiUser } from 'react-icons/fi';
import BuilderStepper from '@/components/certification/builder/BuilderStepper';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import FormikTermsAgreement from '@/components/common/form/formik/FormikTermsAgreement';
import ApplicationStatusCard from '@/components/certification/apply/ApplicationStatusCard';
import {
  QTE_APPLICATION_SECTIONS,
  QTE_DRAFT_NOTE,
  LAST_QTE_SECTION,
  firstQteSectionWithError,
  touchedFor,
} from './qteApplication';

const DOCUMENT_ACCEPT = { 'application/pdf': [], 'image/png': [], 'image/jpeg': [] };
const PANEL_ID_PREFIX = 'qte-application-section';
const AUTOSAVE_DELAY_MS = 400;
const STEPPER_STEPS = QTE_APPLICATION_SECTIONS.map((section, index) => ({
  id: index,
  label: section.shortTitle || section.title,
  panelId: `${PANEL_ID_PREFIX}-${index}`,
}));

const AboutSection = () => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormikField name="legal_name" label="Legal Name" placeholder="Legal Name" Icon={FiUser} required />
      <FormikField name="public_name" label="Public Name" placeholder="Public Name" Icon={FiUser} required />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormikField name="country" label="Country" placeholder="Country" required />
      <FormikField name="timezone" label="Timezone" placeholder="e.g. America/New_York" required />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormikField type="number" name="teaching_experience_years" label="Teaching Experience (years)" placeholder="0" required />
      <FormikField type="number" name="prior_student_count" label="Prior Student Count" placeholder="0" required />
    </div>
  </>
);

const MaterialsSection = () => (
  <>
    <FormikField name="sample_curriculum" label="Sample Curriculum (link)" placeholder="https://" required />
    <FormikField name="sample_lecture_link" label="Sample Lecture (link, any platform)" placeholder="https://" required />
    <FormikDropzone
      name="government_id_file"
      label="Government ID"
      required
      accept={DOCUMENT_ACCEPT}
      supportedFilesText="pdf, jpg, jpeg and png files are supported."
    />
    <FormikDropzone
      name="resume_file"
      label="Resume"
      required
      accept={DOCUMENT_ACCEPT}
      supportedFilesText="pdf, jpg, jpeg and png files are supported."
    />
    <FormikTermsAgreement name="agreement_accepted" />
  </>
);

const SECTION_COMPONENTS = [AboutSection, MaterialsSection];

/**
 * Moving between the sections of the one Formik form. Forward checks every section from the current one up to
 * the target and stops at the first with an error (shown there); back is never blocked. `submit` checks the whole
 * form first and jumps to the first section with an error, so a hidden section's problem is never silent.
 */
export const useQteSectionNavigation = (section, setSection) => {
  const { validateForm, setTouched, touched, submitForm } = useFormikContext();

  const goTo = useCallback(
    async target => {
      if (target === section) return;
      if (target < section) {
        setSection(target);
        return;
      }
      const errors = await validateForm();
      for (let index = section; index < target; index += 1) {
        if (QTE_APPLICATION_SECTIONS[index].fields.some(field => errors[field])) {
          setTouched({ ...touched, ...touchedFor(QTE_APPLICATION_SECTIONS[index].fields) }, false);
          setSection(index);
          return;
        }
      }
      setSection(target);
    },
    [section, setSection, validateForm, setTouched, touched]
  );

  const submit = useCallback(async () => {
    const errors = await validateForm();
    const failing = firstQteSectionWithError(errors);
    if (failing !== undefined) {
      setTouched(touchedFor(QTE_APPLICATION_SECTIONS.flatMap(item => item.fields)), false);
      setSection(failing);
      return;
    }
    await submitForm();
  }, [validateForm, setTouched, setSection, submitForm]);

  return { goTo, submit };
};

// Writes the in-progress answers to this device shortly after the last keystroke.
const DraftAutosave = ({ onPersist }) => {
  const { values, dirty } = useFormikContext();
  useEffect(() => {
    if (!dirty) return undefined; // never write a draft for a form the user has not changed
    const timer = setTimeout(() => onPersist(values), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [values, dirty, onPersist]);
  return null;
};

/**
 * Step 4 of the wizard — the QTE application, in two short sections. `isBlocked` (already submitted / in review
 * / approved) shows the status card instead of the form. `onPersist(values)` saves the device-only draft.
 */
const QteApplicationStep = ({ section, onSectionChange, selected, isBlocked, onPersist }) => {
  const { goTo } = useQteSectionNavigation(section, onSectionChange);
  const SectionFields = SECTION_COMPONENTS[section];
  const current = QTE_APPLICATION_SECTIONS[section];
  const panel = STEPPER_STEPS[section];

  if (isBlocked) {
    return (
      <div className="space-y-6">
        <ApplicationStatusCard applicationStatus={selected.application_status} rejectedReason={selected.rejected_reason} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DraftAutosave onPersist={onPersist} />
      {selected?.application_status === 'rejected' && selected?.rejected_reason ? (
        <ApplicationStatusCard applicationStatus="rejected" rejectedReason={selected.rejected_reason} />
      ) : null}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <FiAward className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        QTE Application
      </h3>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400" aria-live="polite">
        Section {section + 1} of {QTE_APPLICATION_SECTIONS.length} · {current.title}
      </p>
      <div className="hidden sm:block">
        <BuilderStepper
          steps={STEPPER_STEPS}
          currentStep={section}
          onSelect={goTo}
          ariaLabel="Application sections"
          itemLabel="Section"
        />
      </div>

      <div role="tabpanel" id={panel.panelId} aria-labelledby={`${panel.panelId}-tab`} className="flex flex-col gap-4">
        <SectionFields />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{QTE_DRAFT_NOTE}</p>
    </div>
  );
};

/** Back / Next / Submit for step 4 (the wizard's shared footer keeps Cancel). */
export const QteStepButtons = ({ section, onSectionChange, onBackToPreviousStep, isSubmitting, uploadingField }) => {
  const { goTo, submit } = useQteSectionNavigation(section, onSectionChange);
  const busy = isSubmitting || Boolean(uploadingField);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        disabled={busy}
        onClick={() => (section > 0 ? goTo(section - 1) : onBackToPreviousStep())}
        className="w-full sm:w-auto min-w-[120px]"
      >
        Back
      </Button>
      {section < LAST_QTE_SECTION ? (
        <Button type="button" size="lg" disabled={busy} onClick={() => goTo(section + 1)} className="w-full sm:w-auto min-w-[180px]">
          Next
        </Button>
      ) : (
        <Button
          type="button"
          size="lg"
          isLoading={busy}
          disabled={busy}
          onClick={submit}
          className="w-full sm:w-auto min-w-[180px] bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {uploadingField ? 'Uploading documents…' : isSubmitting ? 'Saving...' : 'Submit QTE Application'}
        </Button>
      )}
    </>
  );
};

export default QteApplicationStep;
