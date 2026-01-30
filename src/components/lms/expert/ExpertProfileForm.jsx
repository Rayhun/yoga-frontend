'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { FaRegFileImage, FaFile } from 'react-icons/fa6';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import { FiMail, FiUser, FiClock, FiPlay, FiGlobe, FiAward, FiTarget, FiInfo } from 'react-icons/fi';
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values }) => (
            <Form className="flex flex-col gap-6">
              {/* Profile Image Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Profile Photo
                </h3>
                <div className="flex justify-center items-center py-4">
                  <div className="relative">
                    <FormikImageInput name="file" label="" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Upload a professional photo that represents you. This will be visible to users.
                </p>
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormikField name="first_name" label="First Name" placeholder="First Name" Icon={FiUser} required />
                  <FormikField name="middle_name" label="Middle Name" placeholder="Middle Name" Icon={FiUser} />
                  <FormikField name="last_name" label="Last Name" placeholder="Last Name" Icon={FiUser} required />
                  <FormikField type="email" name="email" label="Email" placeholder="Email" Icon={FiMail} disabled={isEditMode} required />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Professional Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <LuBriefcaseBusiness className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormikSelect name="title" label="Title" placeholder="Select Title" options={TITLE_OPTIONS} required />
                  <FormikField name="business_name" label="Business Name" placeholder="Business Name" Icon={LuBriefcaseBusiness} required />
                  <FormikField
                    type="number"
                    name="experience"
                    label="Experience (Years)"
                    placeholder="Experience in Years"
                    min={0}
                    Icon={FiClock}
                    required
                  />
                  <FormikField name="intro" label="Intro Video" placeholder="YouTube or Vimeo URL" Icon={FiPlay} required />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Social & Links Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiGlobe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Social & Links
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormikField name="linkedin" label="LinkedIn Profile" placeholder="LinkedIn Profile URL" Icon={FaLinkedin} />
                  <FormikField name="website" label="Website URL" placeholder="Website URL" Icon={FiGlobe} required />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Coaching Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiTarget className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Coaching Details
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormikSelect
                    name="coaching_style"
                    label="Coaching Style"
                    placeholder="Select Coaching Style"
                    options={COACHING_STYLES_OPTIONS}
                    required
                  />
                  <FormikMultiSelect
                    name="culture_experience"
                    label="Culture Experience"
                    placeholder="Select Culture Experience"
                    options={CULTURE_EXPERIENCE_OPTIONS}
                    required
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* About Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiInfo className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  About
                </h3>
                <FormikRichTextEditor name="description" label="Description" placeholder="Tell us about yourself (25-150 words)" rows={5} required />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Coaching Areas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiTarget className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Coaching Areas
                </h3>
                <CoachingAreasField
                  name="coaching_areas"
                  label=""
                  placeholder="Select or add coaching areas"
                  required
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Certifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiAward className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Certifications
                </h3>
                <CertificationsField
                  name="certifications"
                  label=""
                  placeholder="Select or add certifications (max 5)"
                  required
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Languages Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiGlobe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Languages
                </h3>
                <FormikMultiSelect
                  options={LANGUAGES}
                  name="languages"
                  label=""
                  placeholder="Select languages you speak"
                  required
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Availability Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Availability</h3>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
                  <FormikSwitch name="available" label="Available for Coaching" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Toggle this option to let students know if you're currently accepting new coaching clients.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="lg" 
                  onClick={handleCancel}
                  className="w-full sm:w-auto min-w-[120px]"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="lg" 
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto min-w-[180px] bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Update Profile' : 'Create Profile'}
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
