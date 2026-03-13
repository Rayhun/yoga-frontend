'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikField from '@/components/common/form/formik/FormikField';
import Button from '@/components/common/Button';
import { IoLink } from 'react-icons/io5';

const MarkCompleteForm = ({ handleSubmit }) => {
  const initialValues = {
    recording_link: '',
  };

  const validationSchema = Yup.object({
    recording_link: Yup.string().required('Recording link is required!'),
  });

  const handleCancel = () => {
    toggleCompletionModal();
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-3 text-left">
          <h1 className="text-2xl font-bold text-dark dark:text-white">Coaching Complete?</h1>
          <FormikField
            type="text"
            name="recording_link"
            label="Please enter the recording link for payment processing"
            placeholder="https://..."
            Icon={IoLink}
            required
          />
          <div className="flex justify-end items-center gap-4 mt-3">
            <Button type="button" variant="secondary" size="2xl" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" size="2xl" isLoading={isSubmitting}>
              {isSubmitting ? 'Submiting...' : 'Submit Recording'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default MarkCompleteForm;
