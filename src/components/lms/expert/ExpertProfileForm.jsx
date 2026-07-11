'use client';
import { useEffect, useMemo, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { CertificationsField, ExpertCatalogTagsField } from '@/components/lms/general/fields';
import {
  EXPERT_PROFILE_CATALOG_FIELDS,
  mapExpertLanguageIds,
  mapExpertTagIds,
  seedExpertTagRows,
} from '@/utils/expertProfileTags';
import {
  addNewExpert,
  getExpertCatalogTagsList,
  getExpertCatalogTagsRows,
  updateExistingExpert,
} from '@/services/private/lms/expert';
import { toastApiError } from '@/utils/helpers';
import { stripHtmlLinks } from '@/utils/stripHtmlLinks';
import queryKeys from '@/utils/query-keys';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { TITLE_OPTIONS } from '@/utils/constants';
import { ONE_MB } from '@/utils/general';
import FormikImageInput from '@/components/common/form/formik/FormikImageInput';

const ExpertProfileForm = ({ selected, isAdminContext = false }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const [savedExpertId, setSavedExpertId] = useState(selected?.id || null);
  const [currentStep, setCurrentStep] = useState(1);
  const [draftValues, setDraftValues] = useState(null);
  const draftStorageKey = `expert_profile_form_draft_${isAdminContext ? 'admin' : 'teacher'}_${selected?.id || 'new'}`;

  const { mutateAsync: addExpert } = useMutation({
    mutationFn: addNewExpert,
  });
  const { mutateAsync: updateExpert } = useMutation({
    mutationFn: updateExistingExpert,
  });

  const needsLanguageResolution = Boolean(
    selected?.languages?.some(
      item =>
        typeof item === 'string' ||
        (item && typeof item === 'object' && item.id == null && (item.label || item.title))
    )
  );

  const { data: languageCatalogResponse } = useQuery({
    queryKey: [queryKeys.expertCatalogTags, 'languages', 'resolve'],
    queryFn: () =>
      getExpertCatalogTagsList({ context: 'expert_profile', field: 'languages', limit: 500 }),
    enabled: needsLanguageResolution,
    staleTime: 5 * 60 * 1000,
  });

  const languageCatalogRows = useMemo(() => {
    return getExpertCatalogTagsRows(languageCatalogResponse).map(row => ({
      id: row.id,
      label: row.label,
      namespace: row.namespace,
      namespaceLabel: row.namespace_label,
    }));
  }, [languageCatalogResponse]);

  const resolvedLanguageIds = useMemo(
    () => mapExpertLanguageIds(selected?.languages, languageCatalogRows),
    [selected?.languages, languageCatalogRows]
  );

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
    practice_type: mapExpertTagIds(selected?.practice_type),
    coaching_style: mapExpertTagIds(selected?.coaching_style),
    culture_experience: mapExpertTagIds(selected?.culture_experience),
    categories: mapExpertTagIds(selected?.categories),
    tags: mapExpertTagIds(selected?.tags),
    coaching_areas: mapExpertTagIds(selected?.coaching_areas),
    certifications: selected?.certifications?.map(item => item?.id).filter(Boolean) || [],
    languages: resolvedLanguageIds,
    // credentials: selected?.credentials?.[0]?.split(',') || [],
    available: selected?.available || false,
    experience: selected?.experience || 0,
    // coaching_content: selected?.coaching_content?.split(',') || [],
    file: selected?.file || null,
    business_logo: selected?.business_logo || null,
    program_file: null,
  };

  const initialValues = draftValues ? { ...baseInitialValues, ...draftValues } : baseInitialValues;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedDraft = localStorage.getItem(draftStorageKey);
    if (!savedDraft) return;
    try {
      const parsedDraft = JSON.parse(savedDraft);
      if (parsedDraft?.values) {
        const values = { ...parsedDraft.values };
        const tagFields = [
          'practice_type',
          'coaching_style',
          'culture_experience',
          'categories',
          'tags',
          'coaching_areas',
          'languages',
        ];
        tagFields.forEach(field => {
          if (Array.isArray(values[field])) {
            values[field] =
              field === 'languages'
                ? mapExpertLanguageIds(values[field], languageCatalogRows)
                : mapExpertTagIds(values[field]);
          }
        });
        if (Array.isArray(values.certifications)) {
          values.certifications = values.certifications
            .map(id => Number(id))
            .filter(id => !Number.isNaN(id));
        }
        setDraftValues(values);
      }
      if (parsedDraft?.step >= 1 && parsedDraft?.step <= 3) setCurrentStep(parsedDraft.step);
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey, languageCatalogRows]);

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
      practice_type: Yup.array()
        .of(Yup.number().required('Required!'))
        .min(1, 'Practice type is required')
        .max(1, 'Only one practice type can be selected'),
      categories: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least one category is required'),
      tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least one focus & approach is required'),
      coaching_areas: Yup.array()
        .of(Yup.number().required('Required!'))
        .min(1, 'At least 1 coaching area is required')
        .max(10, 'Maximum 10 coaching areas are allowed'),
      certifications: Yup.array()
        .of(Yup.number().required('Required!'))
        .min(1, 'At least 1 certification is required')
        .max(5, 'Maximum 5 certifications are allowed'),
      languages: Yup.array()
        .transform(value =>
          Array.isArray(value) ? value.map(v => Number(v)).filter(n => !Number.isNaN(n)) : value
        )
        .of(Yup.number().required('Required!'))
        .min(1, 'At least 1 language is required'),
      culture_experience: Yup.array()
        .of(Yup.number().required('Required!'))
        .min(1, 'At least one culture experience is required'),
      coaching_style: Yup.array()
        .of(Yup.number().required('Required!'))
        .min(1, 'At least one coaching style is required'),
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
      business_logo: Yup.mixed()
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
        'practice_type',
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
      3: ['file', 'business_logo'],
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
      const normalizedPayload = { ...values };

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
          practice_type: normalizedPayload.practice_type,
          coaching_style: normalizedPayload.coaching_style,
          culture_experience: normalizedPayload.culture_experience,
          description: stripHtmlLinks(normalizedPayload.description),
          categories: normalizedPayload.categories,
          tags: normalizedPayload.tags,
          coaching_areas: normalizedPayload.coaching_areas,
          certifications: normalizedPayload.certifications,
          languages: normalizedPayload.languages,
          available: normalizedPayload.available,
        },
        3: {
          file: normalizedPayload.file,
          business_logo: normalizedPayload.business_logo,
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
                

                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FiInfo className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      About
                    </h3>
                    <FormikRichTextEditor name="description" label="Description" placeholder="Tell us about yourself (25-500 words)" rows={5} required disableLinks />
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700" />
                  <ExpertCatalogTagsField
                    name="practice_type"
                    field={EXPERT_PROFILE_CATALOG_FIELDS.practice_type.field}
                    label={EXPERT_PROFILE_CATALOG_FIELDS.practice_type.label}
                    modalTitle={EXPERT_PROFILE_CATALOG_FIELDS.practice_type.modalTitle}
                    triggerPlaceholder={EXPERT_PROFILE_CATALOG_FIELDS.practice_type.triggerPlaceholder}
                    seedRows={seedExpertTagRows(selected?.practice_type)}
                    maxSelections={1}
                    required
                  />

                  <div className="border-t border-gray-200 dark:border-gray-700" />
                  <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                    <ExpertCatalogTagsField
                      name="categories"
                      field={EXPERT_PROFILE_CATALOG_FIELDS.categories.field}
                      label={EXPERT_PROFILE_CATALOG_FIELDS.categories.label}
                      modalTitle={EXPERT_PROFILE_CATALOG_FIELDS.categories.modalTitle}
                      triggerPlaceholder={EXPERT_PROFILE_CATALOG_FIELDS.categories.triggerPlaceholder}
                      seedRows={seedExpertTagRows(selected?.categories)}
                      required
                    />
                    <ExpertCatalogTagsField
                      name="tags"
                      field={EXPERT_PROFILE_CATALOG_FIELDS.tags.field}
                      label={EXPERT_PROFILE_CATALOG_FIELDS.tags.label}
                      modalTitle={EXPERT_PROFILE_CATALOG_FIELDS.tags.modalTitle}
                      triggerPlaceholder={EXPERT_PROFILE_CATALOG_FIELDS.tags.triggerPlaceholder}
                      seedRows={seedExpertTagRows(selected?.tags)}
                      required
                    />
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                    <CertificationsField name="certifications" required />
                    <ExpertCatalogTagsField
                      name="languages"
                      field={EXPERT_PROFILE_CATALOG_FIELDS.languages.field}
                      label={EXPERT_PROFILE_CATALOG_FIELDS.languages.label}
                      modalTitle={EXPERT_PROFILE_CATALOG_FIELDS.languages.modalTitle}
                      triggerPlaceholder={EXPERT_PROFILE_CATALOG_FIELDS.languages.triggerPlaceholder}
                      seedRows={seedExpertTagRows(selected?.languages)}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FiTarget className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Coaching Details
                    </h3>
                    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                      <ExpertCatalogTagsField
                        name="coaching_style"
                        field={EXPERT_PROFILE_CATALOG_FIELDS.coaching_style.field}
                        label={EXPERT_PROFILE_CATALOG_FIELDS.coaching_style.label}
                        modalTitle={EXPERT_PROFILE_CATALOG_FIELDS.coaching_style.modalTitle}
                        triggerPlaceholder={EXPERT_PROFILE_CATALOG_FIELDS.coaching_style.triggerPlaceholder}
                        seedRows={seedExpertTagRows(selected?.coaching_style)}
                        required
                      />
                      <ExpertCatalogTagsField
                        name="culture_experience"
                        field={EXPERT_PROFILE_CATALOG_FIELDS.culture_experience.field}
                        label={EXPERT_PROFILE_CATALOG_FIELDS.culture_experience.label}
                        modalTitle={EXPERT_PROFILE_CATALOG_FIELDS.culture_experience.modalTitle}
                        triggerPlaceholder={EXPERT_PROFILE_CATALOG_FIELDS.culture_experience.triggerPlaceholder}
                        seedRows={seedExpertTagRows(selected?.culture_experience)}
                        required
                      />
                    </div>
                    <ExpertCatalogTagsField
                      name="coaching_areas"
                      field={EXPERT_PROFILE_CATALOG_FIELDS.coaching_areas.field}
                      label={EXPERT_PROFILE_CATALOG_FIELDS.coaching_areas.label}
                      modalTitle={EXPERT_PROFILE_CATALOG_FIELDS.coaching_areas.modalTitle}
                      triggerPlaceholder={EXPERT_PROFILE_CATALOG_FIELDS.coaching_areas.triggerPlaceholder}
                      seedRows={seedExpertTagRows(selected?.coaching_areas)}
                      required
                    />
                  </div>
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
                <div className="space-y-8">
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

                  <div className="border-t border-gray-200 dark:border-gray-700" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <LuBriefcaseBusiness className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Business Logo
                    </h3>
                    <div className="flex justify-center items-center py-4">
                      <div className="relative">
                        <FormikImageInput name="business_logo" label="" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Upload your business or brand logo. This will appear on your profile alongside your business name.
                    </p>
                  </div>
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
