'use client';
import Link from 'next/link';
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
      {({ isSubmitting, values }) => (
        <Form className="flex flex-col gap-4">
          <FormikDropzone
            name="file"
            supportedFilesText={validationError}
            maxSize={maxSize}
            {...dropzoneProps}
          />
          
          {/* File Info Display */}
          {values.file && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{values.file.name}</p>
                  <p className="text-xs text-gray-600">{(values.file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            size="2xl" 
            isLoading={isSubmitting}
            disabled={!values.file || isSubmitting}
            className={`w-full ${
              !values.file 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload CSV File
              </span>
            )}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default FileSelectorForm;
