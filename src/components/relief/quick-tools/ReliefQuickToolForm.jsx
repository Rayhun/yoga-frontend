'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';
import FormikMultiOptionsModalField from '@/components/common/form/formik/FormikMultiOptionsModalField';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { getTagsList } from '@/services/private/lms/tag';
import {
  addReliefQuickTool,
  updateReliefQuickTool,
} from '@/services/private/relief/quick-tools';
import ReliefQuickToolSectionBuilder from './ReliefQuickToolSectionBuilder';
import GuidedSessionContentFields from './GuidedSessionContentFields';

const ReliefQuickToolForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { data: tagsResponse, isLoading: tagsLoading } = useQuery({
    queryFn: () =>
      getTagsList({ limit: 500, offset: 0, namespace: 'relief_quick_tool', status: 'active' }),
    queryKey: [queryKeys.lmsTags, 'relief-quick-tool-form'],
    select: response =>
      (response?.data?.data?.results || response?.data?.data || []).map(tag => ({
        label: tag.label,
        value: tag.id,
      })),
  });

  const { mutateAsync: createTool } = useMutation({
    mutationFn: addReliefQuickTool,
  });
  const { mutateAsync: updateTool } = useMutation({
    mutationFn: updateReliefQuickTool,
  });

  const initialValues = {
    slug: selected?.slug || '',
    page_id: selected?.page_id || '',
    title: selected?.title || '',
    subtitle: selected?.subtitle || '',
    icon: selected?.icon || '🧘',
    category_label: selected?.category_label || '',
    avatar_icon: selected?.avatar_icon || '',
    guided_content_source: selected?.guided_content_source || 'custom',
    guided_content_type: selected?.guided_content_type || '',
    guided_content_link: selected?.guided_content_link || '',
    guided_session_id: selected?.guided_session_id || null,
    tag_ids: selected?.tags?.map(tag => tag.id) || [],
    is_active: selected?.is_active ?? true,
    sections: selected?.sections || [],
  };

  const validationSchema = Yup.object({
    slug: Yup.string().trim().required('Slug is required'),
    title: Yup.string().trim().required('Title is required'),
    guided_content_link: Yup.string()
      .trim()
      .test('is-url-or-empty', 'Enter a valid URL', value => !value || Yup.string().url().isValidSync(value)),
    guided_session_id: Yup.number()
      .nullable()
      .when('guided_content_source', {
        is: 'session',
        then: schema => schema.required('Select a session'),
        otherwise: schema => schema.nullable(),
      }),
    tag_ids: Yup.array().of(Yup.number()),
    sections: Yup.array().of(
      Yup.object({
        section_id: Yup.string().trim().required('Section ID is required'),
        card_type: Yup.string().required('Card type is required'),
      })
    ),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        slug: values.slug.trim(),
        guided_content_link:
          values.guided_content_source === 'custom'
            ? values.guided_content_link?.trim() || ''
            : '',
        guided_session_id:
          values.guided_content_source === 'session' ? values.guided_session_id : null,
      };

      if (isEditMode) {
        await updateTool({ payload: { id: selected.id, ...payload } });
        toast.success('Relief quick tool updated successfully');
      } else {
        await createTool({ payload });
        toast.success('Relief quick tool added successfully');
      }

      await queryClient.invalidateQueries({ queryKey: [queryKeys.reliefQuickTools] });
      router.push('/portal/admin/relief/quick-tools');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper
      title="Relief Quick Tool Form"
      description="Manage quick relief action cards, tags, content sections, and guided session media"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-6">
            <div className="rounded-2xl border border-stone-200 p-5">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Basic Info</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <FormikField name="title" label="Title" placeholder="Headache Relief" required />
                <FormikField name="slug" label="Slug" placeholder="headache" required />
                <FormikField name="subtitle" label="Subtitle" placeholder="Short description" />
                <FormikField name="icon" label="Icon" placeholder="🤕" />
                <FormikCheckbox name="is_active" label="Active" />
              </div>

              <div className="mt-4">
                <FormikMultiOptionsModalField
                  name="tag_ids"
                  label="Tags"
                  options={tagsResponse || []}
                  chipKind="tag"
                  modalTitle="Select tags"
                  triggerPlaceholder="Select tags"
                  searchPlaceholder="Search tags…"
                  loading={tagsLoading}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 p-5">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Detail Page Header</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <FormikField name="page_id" label="Page ID" placeholder="headache_relief_protocol" />
                <FormikField name="category_label" label="Category Label" placeholder="QUICK RELIEF · 8 MIN" />
                <FormikField name="avatar_icon" label="Avatar Icon" placeholder="🤕" />
              </div>
            </div>

            <GuidedSessionContentFields />

            <ReliefQuickToolSectionBuilder />

            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default ReliefQuickToolForm;
