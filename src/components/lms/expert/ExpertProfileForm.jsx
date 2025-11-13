'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { FaRegFileImage, FaFile } from 'react-icons/fa6';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import { FiMail, FiUser, FiClock, FiPlay, FiGlobe } from 'react-icons/fi';
import { FaLinkedin } from 'react-icons/fa';
import { LuBriefcaseBusiness } from 'react-icons/lu';
import FormikRichTextEditor from '@/components/common/form/formik/FormikRichTextEditor';
// import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
// import FormikSubmittableField from '@/components/common/form/formik/FormikSubmittable';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
// import { TagsField } from '@/components/lms/general/fields';
import { addNewExpert, updateExistingExpert } from '@/services/private/lms/expert';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import { COACHING_STYLES_OPTIONS, CULTURE_EXPERIENCE_OPTIONS, LANGUAGES, TITLE_OPTIONS } from '@/utils/constants';
import { ONE_MB } from '@/utils/general';
import FormikImageInput from '@/components/common/form/formik/FormikImageInput';
import CoachingAreasField from '../general/fields/CoachingAreasField';
import CertificationsField from '../general/fields/CertificationsField';

const ExpertProfileForm = ({ selected, isAdminContext = false }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { mutateAsync: addExpert } = useMutation({
    mutationFn: addNewExpert,
  });
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
    coaching_areas: selected?.coaching_areas?.map(i => i.id) || [],
    certifications: selected?.certifications?.map(i => i.id) || [],
    languages: selected?.languages?.[0]?.split(',') || [],
    // credentials: selected?.credentials?.[0]?.split(',') || [],
    available: selected?.available || false,
    experience: selected?.experience || 0,
    // coaching_content: selected?.coaching_content?.split(',') || [],
    culture_experience: selected?.culture_experience?.split(',') || [],
    coaching_style: selected?.coaching_style || '',
    file: selected?.file || null,
    program_file: null,
  };

  const validationSchema = Yup.object({
    first_name: Yup.string()
      .transform(value => (value ? value.trim() : value))
      .required('Required!')
      .test('no-whitespace-only', 'First name cannot be only spaces', value => {
        return value && value.length > 0;
      }),
    middle_name: Yup.string()
      .transform(value => (value ? value.trim() : value)), // Only field that remains optional
    last_name: Yup.string()
      .transform(value => (value ? value.trim() : value))
      .required('Required!')
      .test('no-whitespace-only', 'Last name cannot be only spaces', value => {
        return value && value.length > 0;
      }),
    email: Yup.string().email('Invalid email format').required('Required!'),
    title: Yup.string().required('Required!'),
    business_name: Yup.string()
      .transform(value => (value ? value.trim() : value))
      .required('Required!')
      .test('no-whitespace-only', 'Business name cannot be only spaces', value => {
        return value && value.length > 0;
      }),
    description: Yup.string()
      .required('Required!')
      .test('max_length', 'Your content must be between 25 and 150 words', value => {
        if (!value) return false;
        // Strip HTML tags for word count
        const textContent = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordsCount = textContent.split(' ').filter(word => word.length > 0).length;
        return wordsCount >= 25 && wordsCount <= 150;
      }),
    coaching_areas: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 tag is required'),
    certifications: Yup.array()
      .of(Yup.string().required('Required!'))
      .min(1, 'At least 1 certification is required')
      .max(5, 'Maximum 5 certifications are allowed'),
    languages: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 language is required'),
    // credentials: Yup.array()
    //   .of(Yup.string().required('Required!'))
    //   .min(1, 'At least 1 credential is required')
    //   .max(5, 'Maximum 5 credentials are allowed'),
    // coaching_content: Yup.array()
    //   .of(Yup.string().required('Required!'))
    //   .min(1, 'At least 1 coaching content is required'),
    culture_experience: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 is required'),
    coaching_style: Yup.string().required('Coaching Style is required'),
    experience: Yup.number()
      .required('Experience is required')
      .integer('Experience must be a whole number')
      .min(0, 'Experience cannot be negative'),
    available: Yup.boolean(),
    intro: Yup.string()
      .transform(value => (value ? value.trim() : value))
      .required('Required!')
      .test('no-whitespace-only', 'Intro cannot be only spaces', value => {
        return value && value.length > 0;
      }),
    linkedin: Yup.string()
      .transform(value => (value ? value.trim() : value)),
    website: Yup.string()
      .transform(value => (value ? value.trim() : value))
      .required('Required!')
      .test('no-whitespace-only', 'Website URL cannot be only spaces', value => {
        return value && value.length > 0;
      }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateExpert({ payload: { id: selected.id, ...values } });
        toast.success('Expert updated successfully');
      } else {
        await addExpert({ payload: { ...values } });
        toast.success('Expert created successfully');
      }
      await queryClient.invalidateQueries([
        {
          queryKey: isEditMode
            ? isAdminContext 
              ? [queryKeys.lmsExperts, selected.id]
              : [queryKeys.teacherProfile, selected.id, queryClient.loggedInUser]
            : isAdminContext
              ? [queryKeys.lmsExperts]
              : [queryKeys.teacherProfile],
        },
      ]);
      
      // Redirect based on context
      if (isAdminContext) {
        router.push('/portal/admin/lms/expert');
      } else {
        router.push('/portal/teacher/profile?active_tab=about');
      }
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
              <div className="flex justify-center items-center mb-5">
                <FormikImageInput name="file" label="Profile Image" />
              </div>
              <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                <div className="w-full xl:w-1/2">
                  <FormikField name="first_name" label="First Name" placeholder="First Name" Icon={FiUser} required />
                </div>

                <div className="w-full xl:w-1/2">
                  <FormikField name="middle_name" label="Middle Name" placeholder="Middle Name" Icon={FiUser} />
                </div>
              </div>
              <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                <div className="w-full xl:w-1/2">
                  <FormikField name="last_name" label="Last Name" placeholder="Last Name" Icon={FiUser} required />
                </div>

                <div className="w-full xl:w-1/2">
                  <FormikField type="email" name="email" label="Email" placeholder="Email" Icon={FiMail} disabled={isEditMode} required />
                </div>
              </div>
              <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                <div className="w-full xl:w-1/2">
                  <FormikSelect name="title" label="Title" placeholder="Select Title" options={TITLE_OPTIONS} required />
                </div>
                <div className="w-full xl:w-1/2">
                  <FormikField name="business_name" label="Business Name" placeholder="Business Name" Icon={LuBriefcaseBusiness} required />
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
                    Icon={FiClock}
                    required
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <FormikField name="intro" label="Intro Video" placeholder="YouTube or Vimeo URL" Icon={FiPlay} required />
                </div>
              </div>
              <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                <div className="w-full xl:w-1/2">
                  <FormikField name="linkedin" label="LinkedIn Profile" placeholder="LinkedIn Profile URL" Icon={FaLinkedin} />
                </div>
                <div className="w-full xl:w-1/2">
                  <FormikField name="website" label="Website URL" placeholder="Website URL" Icon={FiGlobe} required />
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
              <FormikRichTextEditor name="description" label="About" placeholder="About" rows={5} required />
              <CoachingAreasField
                name="coaching_areas"
                label="Coaching Areas"
                placeholder="Coaching Areas"
                required
              />
              <CertificationsField
                name="certifications"
                label="Certifications"
                placeholder="Certifications"
                required
              />

              {/* <FormikSubmittableField
                name="credentials"
                label="Certifications"
                placeholder="Add a certification (e.g. Health Coach). Press return to confirm, max 5."
                required
                disabled={values?.credentials?.length >= 5}
              /> */}
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
                  {isSubmitting ? 'Submitting...' : isEditMode ? 'Update Expert' : 'Create Expert'}
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
