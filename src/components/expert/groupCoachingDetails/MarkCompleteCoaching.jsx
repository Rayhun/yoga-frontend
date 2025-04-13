'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Cookies from 'js-cookie';
import FormikField from '@/components/common/form/formik/FormikField';
import Button from '@/components/common/Button';
import { toastApiError } from '@/utils/helpers';
import { IoLink } from 'react-icons/io5';

const MarkCompleteCoachingForm = ({ handleSubmit }) => {
  const initialValues = {
    recording_link: '',
  };

  const validationSchema = Yup.object({
    recording_link: Yup.string().required('Required!'),
  });

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-3 text-left">
          <FormikField
            type="text"
            name="recording_link"
            label="Recording Link"
            placeholder="Recording Link"
            Icon={IoLink}
            required
          />

          <Button type="submit" size="5xl" className="mt-3" isLoading={isSubmitting}>
            {isSubmitting ? 'Completing...' : 'Mark as Complete'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default MarkCompleteCoachingForm;
