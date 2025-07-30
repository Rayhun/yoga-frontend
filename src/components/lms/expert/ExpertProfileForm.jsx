'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaRegFileImage, FaFile } from 'react-icons/fa6';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import FormikSubmittableField from '@/components/common/form/formik/FormikSubmittable';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import { TagsField } from '@/components/lms/general/fields';
import { updateExistingExpert } from '@/services/private/lms/expert';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import { COACHING_STYLES_OPTIONS, CULTURE_EXPERIENCE_OPTIONS, LANGUAGES } from '@/utils/constants';
import { ONE_MB } from '@/utils/general';
import FormikImageInput from '@/components/common/form/formik/FormikImageInput';

const ExpertProfileForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { mutateAsync: updateExpert } = useMutation({
    mutationFn: updateExistingExpert,
  });

  const initialValues = {
    first_name: selected?.first_name || '',
    middle_name: selected?.middle_name || '',
    last_name: selected?.last_name || '',
    email: selected?.email || '',
    linkedin: selected?.linkedin || '',
    website: selected?.website || '',
    title: selected?.title || '',
    intro: selected?.intro || '',
    business_name: selected?.business_name || '',
    description: selected?.description || '',
    categories: selected?.categories?.map(i => i.id) || [],
    tags: selected?.tags?.map(i => i.id) || [],
    languages: selected?.languages?.[0]?.split(',') || [],
    credentials: selected?.credentials?.[0]?.split(',') || [],
    available: selected?.available || false,
    experience: selected?.experience || 0,
    // coaching_content: selected?.coaching_content?.split(',') || [],
    culture_experience: selected?.culture_experience?.split(',') || [],
    coaching_style: selected?.coaching_style || '',
    file: selected?.file || null,
    program_file: null,
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().required('Required!'),
    middle_name: Yup.string(),
    last_name: Yup.string().required('Required!'),
    email: Yup.string().email('Invalid email format').required('Required!'),
    title: Yup.string().required('Required!'),
    business_name: Yup.string(),
    description: Yup.string()
      .required('Required!')
      .test('max_length', 'Your content must be between 25 and 150 words', value => {
        const wordsCount = value.split(' ').length;
        return wordsCount >= 25 && wordsCount <= 150;
      }),
    tags: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 tag is required'),
    languages: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 language is required'),
    credentials: Yup.array()
      .of(Yup.string().required('Required!'))
      .min(1, 'At least 1 credential is required')
      .max(5, 'Maximum 5 credentials are allowed'),
    // coaching_content: Yup.array()
    //   .of(Yup.string().required('Required!'))
    //   .min(1, 'At least 1 coaching content is required'),
    culture_experience: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 is required'),
    coaching_style: Yup.string().required('Coanching Style is required'),
    experience: Yup.number()
      .required('Experience is required')
      .integer('Experience must be a whole number')
      .min(0, 'Experience cannot be negative'),
    available: Yup.boolean(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await updateExpert({ payload: { id: selected.id, ...values } });
      toast.success('Expert updated successfully');
      await queryClient.invalidateQueries([
        {
          queryKey: isEditMode
            ? [queryKeys.teacherProfile, selected.id, queryClient.loggedInUser]
            : [queryKeys.teacherProfile],
        },
      ]);
      router.push('/portal/teacher/profile??active_tab=about');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
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
          {({ isSubmitting, values }) => (
            <Form className="flex flex-col gap-3">
              <div className='flex justify-center items-center mb-5'>
              <FormikImageInput name="file" label="Profile Image" />
              </div>
              <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                <div className="w-full xl:w-1/2">
                  <FormikField name="first_name" label="First Name" placeholder="First Name" required />
                </div>

                <div className="w-full xl:w-1/2">
                  <FormikField name="middle_name" label="Middle Name" placeholder="Middle Name" />
                </div>
              </div>
              <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                <div className="w-full xl:w-1/2">
                  <FormikField name="last_name" label="Last Name" placeholder="Last Name" required />
                </div>

                <div className="w-full xl:w-1/2">
                  <FormikField type="email" name="email" label="Email" placeholder="Email" disabled />
                </div>
              </div>
              <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                <div className="w-full xl:w-1/2">
                  <FormikField name="title" label="Title" placeholder="Title" required />
                </div>
                <div className="w-full xl:w-1/2">
                  <FormikField name="business_name" label="Business Name" placeholder="Business Name" />
                </div>
              </div>
              <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                <div className="w-full xl:w-1/2">
                  <FormikField
                    type="number"
                    name="experience"
                    label="Experience (Years)"
                    placeholder="Experience in Years"
                    min={0}
                    required
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <FormikField name="intro" label="Intro Video" placeholder="YouTube or Vimeo URL" />
                </div>
              </div>
              <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                <div className="w-full xl:w-1/2">
                  <FormikField name="linkedin" label="LinkedIn Profile" placeholder="LinkedIn Profile URL" />
                </div>
                <div className="w-full xl:w-1/2">
                  <FormikField name="website" label="Website URL" placeholder="Website URL" />
                </div>
              </div>
              <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                <div className="w-full xl:w-1/2">
                  <FormikSelect
                    name="coaching_style"
                    label="Coaching Style"
                    options={COACHING_STYLES_OPTIONS}
                    required
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <FormikMultiSelect
                    name="culture_experience"
                    label="Culture Experience"
                    options={CULTURE_EXPERIENCE_OPTIONS}
                    required
                  />
                </div>
              </div>
              <FormikField name="description" label="About" placeholder="About" rows={5} required />
              <TagsField name="tags" label="Coaching Areas" placeholder="Coaching Areas" required />
              <FormikSubmittableField
                name="credentials"
                label="Certifications"
                placeholder="Add a certification (e.g. Health Coach). Press return to confirm, max 5."
                required
                disabled={values?.credentials?.length >= 5}
              />
              <FormikMultiSelect
                options={LANGUAGES}
                name="languages"
                label="Languages"
                placeholder="Languages"
                required
              />
              {/* <FormikSubmittableField
                name="coaching_content"
                label="My Coaching Content"
                placeholder="My Coaching Content"
                required
              /> */}
              <div className="">
                {/* <div className="w-full xl:w-1/2"> */}
                {/* <FormikDropzone
                  name="file"
                  label="Profile Image"
                  fileURLs={selected?.file ? [selected.file] : []}
                  Icon={FaRegFileImage}
                  required
                  maxSize={10 * ONE_MB}
                /> */}
                {/* </div> */}

                {/* <div className="w-full xl:w-1/2">
                  <FormikDropzone
                    name="program_file"
                    label="Program File"
                    fileURLs={selected?.program_file ? [selected.program_file] : []}
                    Icon={FaFile}
                    multiple
                    accept={{
                      'text/csv': ['.csv'],
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                      'application/vnd.ms-excel': ['.xls'],
                    }}
                    supportedFilesText = 'csv, xlsx and xls files files are supported'
                  />
                  <div className='text-right mt-5'><a href="" className='text-primary hover:underline text-md'>Download Sample Csv</a></div>
                </div> */}
              </div>
              <div className="my-5">
                <FormikSwitch name="available" label="Available for Coaching" />
              </div>
              <div className="w-ful flex justify-center sm:justify-end items-center gap-4 flex-wrap-reverse">
                <Button type="button" variant="secondary" size="2xl" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" size="2xl" isLoading={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit My Profile'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ExpertProfileForm;
