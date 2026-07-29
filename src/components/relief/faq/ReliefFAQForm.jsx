'use client';
import { useMemo } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikRichTextEditor from '@/components/common/form/formik/FormikRichTextEditor';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikMultiOptionsModalField from '@/components/common/form/formik/FormikMultiOptionsModalField';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import {
  addReliefFAQ,
  getReliefFAQCategoryOptions,
  updateReliefFAQ,
} from '@/services/private/relief/faq';
import { getTagsList } from '@/services/private/lms/tag';

const ReliefFAQForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryFn: getReliefFAQCategoryOptions,
    queryKey: [queryKeys.reliefFaqCategories],
    select: response => response?.data?.data || [],
  });

  const categoryOptions = useMemo(
    () =>
      categories.map(category => ({
        label: category,
        value: category,
      })),
    [categories]
  );

  const { data: tagsResponse, isLoading: tagsLoading } = useQuery({
    queryFn: () => getTagsList({ limit: 500, offset: 0, namespace: 'relief_faq', status: 'active' }),
    queryKey: [queryKeys.lmsTags, 'relief-faq-form'],
    select: response =>
      (response?.data?.data?.results || response?.data?.data || []).map(tag => ({
        label: tag.label,
        value: tag.id,
      })),
  });

  const { mutateAsync: createFAQ } = useMutation({
    mutationFn: addReliefFAQ,
  });
  const { mutateAsync: updateFAQ } = useMutation({
    mutationFn: updateReliefFAQ,
  });

  const initialValues = {
    category: selected?.category || '',
    question: selected?.question || '',
    answer: selected?.answer || '',
    icon: selected?.icon || '❓',
    slug: selected?.slug || '',
    sort_order: selected?.sort_order ?? 0,
    is_active: selected?.is_active ?? true,
    tag_ids: selected?.tags?.map(tag => tag.id) || [],
  };

  const validationSchema = Yup.object({
    category: Yup.string().trim().required('Category is required'),
    question: Yup.string().required('Question is required'),
    answer: Yup.string(),
    icon: Yup.string().required('Icon is required'),
    slug: Yup.string().nullable(),
    sort_order: Yup.number().required('Sort order is required').min(0).max(999),
    is_active: Yup.boolean(),
    tag_ids: Yup.array().of(Yup.number()),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        category: values.category.trim(),
      };

      if (isEditMode) {
        await updateFAQ({ payload: { id: selected.id, ...payload } });
        toast.success('Relief FAQ updated successfully');
      } else {
        await createFAQ({ payload });
        toast.success('Relief FAQ added successfully');
      }

      await queryClient.invalidateQueries({ queryKey: [queryKeys.reliefFaqs] });
      await queryClient.invalidateQueries({ queryKey: [queryKeys.reliefFaqCategories] });
      router.push('/portal/admin/relief/faq');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Relief FAQ Form" description="Add or edit a Relief FAQ entry">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikSelect
                  name="category"
                  label="Category"
                  placeholder="Select category"
                  modalTitle="Select category"
                  searchPlaceholder="Search or type a new category"
                  options={categoryOptions}
                  loading={categoriesLoading}
                  freeSolo
                  required
                />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikField name="icon" label="Icon" placeholder="e.g. 🧬" required />
              </div>
            </div>

            <FormikField name="question" label="Question" placeholder="Enter question" required />
            <FormikRichTextEditor
              name="answer"
              label="Answer"
              rows={4}
              placeholder="Write answer here..."
            />

            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField name="slug" label="Slug" placeholder="Optional slug" />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikField
                  name="sort_order"
                  label="Sort Order"
                  placeholder="Sort order"
                  required
                  min={0}
                  max={999}
                  type="number"
                />
              </div>
            </div>

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

            <FormikCheckbox name="is_active" label="Active" />

            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default ReliefFAQForm;
