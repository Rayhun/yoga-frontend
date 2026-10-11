'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Modal } from '@mui/material';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';

const TOUCH_TARGET = 'min-h-[44px]';

const validationSchema = Yup.object({
  email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
  first_name: Yup.string().trim().required('First name is required'),
  last_name: Yup.string().trim().required('Last name is required'),
  legal_name: Yup.string().trim().max(255),
  public_name: Yup.string().trim().max(255),
  country: Yup.string().trim().max(100),
  timezone: Yup.string().trim().max(100),
});

const emptyValues = { email: '', first_name: '', last_name: '', legal_name: '', public_name: '', country: '', timezone: '' };

// Two sections of at most four inputs each (the client's "6 inputs or fewer" rule).
const Section = ({ title, children }) => (
  <fieldset className="flex flex-col gap-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
    <legend className="px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</legend>
    {children}
  </fieldset>
);

// `onSubmit(values)` resolves to { ok } or { ok: false, fieldErrors, message }; server field errors are shown
// under their inputs. `initialErrors` pre-fills such errors (used when rendering a failed state).
export const AddQteForm = ({ onSubmit, onClose, initialErrors = {} }) => (
  <Formik
    initialValues={emptyValues}
    initialErrors={initialErrors}
    initialTouched={Object.fromEntries(Object.keys(initialErrors).map(field => [field, true]))}
    validationSchema={validationSchema}
    onSubmit={async (values, { setErrors, setTouched, setSubmitting }) => {
      const result = await onSubmit(values);
      setSubmitting(false);
      if (result?.ok) return;
      const fieldErrors = result?.fieldErrors || {};
      setErrors(fieldErrors);
      setTouched(Object.fromEntries(Object.keys(fieldErrors).map(field => [field, true])), false);
    }}
  >
    {({ isSubmitting }) => (
      <Form className="flex flex-col gap-4" noValidate>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Creates a QTE record in Draft. We email them a link to set their own password.
        </p>
        <Section title="Required">
          <FormikField name="email" label="Email" type="email" required autoComplete="off" />
          <FormikField name="first_name" label="First name" required />
          <FormikField name="last_name" label="Last name" required />
        </Section>
        <Section title="Optional details">
          <FormikField name="legal_name" label="Legal name" />
          <FormikField name="public_name" label="Public name" />
          <FormikField name="country" label="Country" />
          <FormikField name="timezone" label="Timezone" />
        </Section>
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" className={TOUCH_TARGET} onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className={TOUCH_TARGET} isLoading={isSubmitting}>
            Create
          </Button>
        </div>
      </Form>
    )}
  </Formik>
);

const AddQteModal = ({ show, onClose, onSubmit }) => (
  <Modal open={show} onClose={onClose} aria-labelledby="add-qte-title">
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="add-qte-title" className="max-h-full w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
        <h2 id="add-qte-title" className="mb-4 text-xl font-semibold">Add New QTE</h2>
        <AddQteForm onSubmit={onSubmit} onClose={onClose} />
      </div>
    </div>
  </Modal>
);

export default AddQteModal;
