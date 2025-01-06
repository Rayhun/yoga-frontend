'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import Button from '@/components/common/Button';
import { ONE_MB } from '@/utils/general';
import { toastApiError } from '@/utils/helpers';

const FileSelectorForm = ({
  done,
  validationError = 'Unsupported file format. Only images are allowed.',
  validate = value => value && value.type.includes('image'),
  maxSize = ONE_MB,
  onSubmit = () => null,
  ...dropzoneProps
}) => {
  const initialValues = {
    file: null,
  };

  const validationSchema = Yup.object({
    file: Yup.mixed().required('Required!').test('validate', validationError, validate),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await onSubmit(values.file);
      setSubmitting(false);
      done();
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-2">
          <FormikDropzone
            name="file"
            supportedFilesText={validationError}
            maxSize={maxSize}
            {...dropzoneProps}
          />
          <Button type="submit" size="2xl" isLoading={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default FileSelectorForm;
