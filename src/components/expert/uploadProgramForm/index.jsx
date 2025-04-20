'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaFile } from 'react-icons/fa6';
import Button from '@/components/common/Button';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import { updateExistingExpert } from '@/services/private/lms/expert';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { uploadPrograms } from '@/services/private/expert/program';

const UploadProgramsFile = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync: upload } = useMutation({
    mutationFn: uploadPrograms,
  });

  const initialValues = {
    program_file: null,
  };

  const validationSchema = Yup.object({
    program_file: Yup.mixed().required('Program file is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await upload({ payload: { ...values } });
      toast.success('Program uploaded successfully');
      await queryClient.invalidateQueries([
        { queryKey: [queryKeys.expertCustomerPrograms]},
      ]);
      router.push('/portal/teacher/profile?active_tab=programs');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDownloadSampleCSV = () => {
    console.log('handleDownloadSampleCSV');
  };
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="p-6.5">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => {
            const handleFileChange = e => {
              const file = e.target.files[0];
              if (values.program_file) {
                setFieldValue('program_file', [...values.program_file, file]);
              } else {
                setFieldValue('program_file', [file]);
              }
            }
            return (
            <Form className="flex flex-col gap-3">
              <div className="flex justify-end items-center gap-6">
                <div className="flex items-center gap-10 p-4">
                  <button
                    onClick={handleDownloadSampleCSV}
                    className="text-primary hover:underline text-sm font-normal"
                  >
                    Download Sample CSV Format
                  </button>

                  <div className="relative inline-block">
                    <label className="flex items-center min-w-70 justify-center px-4 py-2 bg-white text-primary border border-primary rounded-lg text-sm hover:bg-primary hover:text-white cursor-pointer transition-colors duration-200">
                      + Upload New Program
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".csv"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Upload file"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <FormikDropzone
                  name="program_file"
                  label="Program Files"
                  fileURLs={[]}
                  Icon={FaFile}
                  multiple
                  required
                  accept={{
                    'text/csv': ['.csv'],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/vnd.ms-excel': ['.xls'],
                  }}
                  supportedFilesText="csv, xlsx and xls files files are supported"
                />
                <div className="flex justify-end items-center gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="2xl"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="2xl" isLoading={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit My Programs'}
                  </Button>
                </div>
              </div>
            </Form>
          )}}
        </Formik>
      </div>
    </div>
  );
};

export default UploadProgramsFile;
