'use client';
import { useEffect, useMemo, useState } from 'react';
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
import { CategoriesField, TagsField } from '@/components/lms/general/fields';
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
import useLMSCoachingAreas from '@/hooks/useLMSCoachingArea';

const ExpertProfileForm = ({ selected, isAdminContext = false }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const [savedExpertId, setSavedExpertId] = useState(selected?.id || null);
  const [currentStep, setCurrentStep] = useState(1);
  const [draftValues, setDraftValues] = useState(null);
  const { options: coachingAreaOptions } = useLMSCoachingAreas('Coaching Areas');
  const { options: certificationOptions } = useLMSCoachingAreas('Certifications');
  const draftStorageKey = `expert_profile_form_draft_${isAdminContext ? 'admin' : 'teacher'}_${selected?.id || 'new'}`;

  const { mutateAsync: addExpert } = useMutation({
    mutationFn: addNewExpert,
  });
  const { mutateAsync: updateExpert } = useMutation({
    mutationFn: updateExistingExpert,
  });

  const baseInitialValues = {
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

  const initialValues = draftValues ? { ...baseInitialValues, ...draftValues } : baseInitialValues;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedDraft = localStorage.getItem(draftStorageKey);
    if (!savedDraft) return;
    try {
      const parsedDraft = JSON.parse(savedDraft);
      if (parsedDraft?.values) setDraftValues(parsedDraft.values);
      if (parsedDraft?.step >= 1 && parsedDraft?.step <= 3) setCurrentStep(parsedDraft.step);
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey]);

  const fullFieldSchema = useMemo(
    () => ({
      first_name: Yup.string()
        .transform(value => (value ? value.trim() : value))
        .required('Required!')
        .test('no-whitespace-only', 'First name cannot be only spaces', value => {
          return value && value.length > 0;
        }),
      middle_name: Yup.string().transform(value => (value ? value.trim() : value)),
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
        .test('max_length', 'Your content must be between 25 and 500 words', value => {
          if (!value) return false;
          const textContent = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          const wordsCount = textContent.split(' ').filter(word => word.length > 0).length;
          return wordsCount >= 25 && wordsCount <= 500;
        }),
      categories: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least one category is required'),
      tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least one tag is required'),
      coaching_areas: Yup.array()
        .of(Yup.mixed().required('Required!'))
        .min(1, 'At least 1 coaching area is required')
        .max(10, 'Maximum 10 coaching areas are allowed'),
      certifications: Yup.array()
        .of(Yup.mixed().required('Required!'))
        .min(1, 'At least 1 certification is required')
        .max(5, 'Maximum 5 certifications are allowed'),
      languages: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 language is required'),
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
      linkedin: Yup.string().transform(value => (value ? value.trim() : value)),
      website: Yup.string()
        .transform(value => (value ? value.trim() : value))
        .required('Required!')
        .test('no-whitespace-only', 'Website URL cannot be only spaces', value => {
          return value && value.length > 0;
        }),
      file: Yup.mixed()
        .nullable()
        .test('fileType', 'Only image files are allowed', value => {
          if (!value || typeof value === 'string') return true;
          return value?.type?.includes('image');
        })
        .test('fileSize', 'File size must be less than 10 MB', value => {
          if (!value || typeof value === 'string') return true;
          return value.size <= 10 * ONE_MB;
        }),
    }),
    []
  );

  const stepFieldKeys = useMemo(
    () => ({
      1: [
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'title',
        'business_name',
        'experience',
        'intro',
        'linkedin',
        'website',
      ],
      2: [
        'coaching_style',
        'culture_experience',
        'description',
        'categories',
        'tags',
        'coaching_areas',
        'certifications',
        'languages',
        'available',
      ],
      3: ['file'],
    }),
    []
  );

  const validationSchema = useMemo(() => {
    const schemaForStep = {};
    stepFieldKeys[currentStep].forEach(key => {
      schemaForStep[key] = fullFieldSchema[key];
    });
    return Yup.object(schemaForStep);
  }, [currentStep, fullFieldSchema, stepFieldKeys]);

  const normalizeLookupIds = (items = [], options = []) => {
    if (!Array.isArray(items)) return [];
    return items
      .map(item => {
        if (item && typeof item === 'object') {
          return item.id ?? item.value ?? item.label ?? null;
        }
        const matchedOption = options.find(
          option =>
            option?.value === item ||
            (typeof item === 'string' &&
              typeof option?.label === 'string' &&
              option.label.toLowerCase() === item.toLowerCase())
        );
        return matchedOption?.value ?? item;
      })
      .filter(value => value !== null && value !== undefined && value !== '');
  };

  const persistDraft = (values, step) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        values,
        step,
      })
    );
  };

  const clearDraft = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(draftStorageKey);
  };

  const handleSubmit = async (values, { setSubmitting, setTouched }) => {
    try {
      const normalizedPayload = {
        ...values,
        coaching_areas: normalizeLookupIds(values.coaching_areas, coachingAreaOptions),
        certifications: normalizeLookupIds(values.certifications, certificationOptions),
      };

      const stepPayloadMap = {
        1: {
          first_name: normalizedPayload.first_name,
          middle_name: normalizedPayload.middle_name,
          last_name: normalizedPayload.last_name,
          email: normalizedPayload.email,
          title: normalizedPayload.title,
          business_name: normalizedPayload.business_name,
          experience: normalizedPayload.experience,
          intro: normalizedPayload.intro,
          linkedin: normalizedPayload.linkedin,
          website: normalizedPayload.website,
        },
        2: {
          coaching_style: normalizedPayload.coaching_style,
          culture_experience: normalizedPayload.culture_experience,
          description: normalizedPayload.description,
          categories: normalizedPayload.categories,
          tags: normalizedPayload.tags,
          coaching_areas: normalizedPayload.coaching_areas,
          certifications: normalizedPayload.certifications,
          languages: normalizedPayload.languages,
          available: normalizedPayload.available,
        },
        3: {
          file: normalizedPayload.file,
        },
      };

      const currentStepPayload = stepPayloadMap[currentStep];
      let expertIdForUpdate = isEditMode ? selected?.id : savedExpertId;

      if (!expertIdForUpdate) {
        const response = await addExpert({ payload: currentStepPayload });
        const createdExpertId = response?.data?.data?.id;
        if (createdExpertId) {
          setSavedExpertId(createdExpertId);
          expertIdForUpdate = createdExpertId;
        }
      } else {
        await updateExpert({ payload: { id: expertIdForUpdate, ...currentStepPayload } });
      }

      if (currentStep < 3) {
        persistDraft(values, currentStep + 1);
        setTouched({});
        setCurrentStep(prev => prev + 1);
        toast.success(`Step ${currentStep} saved successfully`);
      } else {
        toast.success(isEditMode ? 'Expert updated successfully' : 'Expert created successfully');
        clearDraft();
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
              <div className="px-2 py-2 flex justify-center">
                <div className="flex items-center justify-center">
                  {[1, 2, 3].map((step, index) => (
                    <div key={step} className="flex items-center">
                      <button
                        type="button"
                        disabled
                        className={`h-10 w-10 shrink-0 rounded-full text-sm font-semibold transition-all duration-300 cursor-default ${
                          currentStep >= step
                            ? 'bg-gradient-to-br from-primary to-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] ring-2 ring-white dark:ring-gray-800 -translate-y-0.5'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 shadow-inner dark:from-gray-700 dark:to-gray-800 dark:text-gray-300'
                        }`}
                        aria-label={`Step ${step}`}
                      >
                        {step}
                      </button>
                      {index < 2 && (
                        <div className="mx-3 sm:mx-4 h-1.5 w-16 sm:w-24 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 shadow-inner dark:from-gray-700 dark:to-gray-800">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              currentStep > step
                                ? 'bg-gradient-to-r from-primary to-emerald-500 shadow-[0_2px_10px_rgba(16,185,129,0.45)] w-full'
                                : 'bg-gradient-to-r from-primary to-emerald-500 w-0'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {currentStep === 1 && (
                <>
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

                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
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

                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
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
                </>
              )}

              {currentStep === 2 && (
                <>
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

                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FiInfo className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      About
                    </h3>
                    <FormikRichTextEditor name="description" label="Description" placeholder="Tell us about yourself (25-500 words)" rows={5} required />
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <CategoriesField name="categories" label="Categories" placeholder="Select categories" required />
                  <TagsField name="tags" label="Tags" placeholder="Select tags" required />

                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <CoachingAreasField
                    name="coaching_areas"
                    label="Coaching Areas"
                    placeholder="Select or add coaching areas (max 10)"
                    required
                  />

                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <CertificationsField
                    name="certifications"
                    label="Certifications"
                    placeholder="Select or add certifications (max 5)"
                    required
                  />

                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <FormikMultiSelect
                    options={LANGUAGES}
                    name="languages"
                    label="Languages"
                    placeholder="Select languages you speak"
                    required
                  />

                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
                    <FormikSwitch name="available" label="Available for Coaching" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Toggle this option to let students know if you&apos;re currently accepting new coaching clients.
                    </p>
                  </div>
                </>
              )}

              {currentStep === 3 && (
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
              )}

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
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      persistDraft(values, currentStep - 1);
                      setCurrentStep(prev => prev - 1);
                    }}
                    className="w-full sm:w-auto min-w-[120px]"
                  >
                    Back
                  </Button>
                )}
                <Button 
                  type="submit" 
                  size="lg" 
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto min-w-[180px] bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : currentStep < 3
                      ? 'Save & Continue'
                      : isEditMode
                        ? 'Update Profile'
                        : 'Create Profile'}
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
