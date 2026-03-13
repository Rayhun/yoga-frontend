'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikRichTextEditor from '@/components/common/form/formik/FormikRichTextEditor';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import { getFilteredSubscriptionPlansList } from '@/services/private/subscription/plan';
import { addNewSubscriptionPage, updateExistingSubscriptionPage } from '@/services/private/subscription/page';
import { toastApiError } from '@/utils/helpers';
import { SUBSCRIPTION_PAGE_TYPE_OPTIONS } from '@/utils/options';
import queryKeys from '@/utils/query-keys';
import React, { useMemo, useState } from 'react';

const SubscriptionPageForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const [selectedType, setSelectedType] = useState(selected?.type || '');
  
  // Update selectedType when selected prop changes (for edit mode)
  React.useEffect(() => {
    if (selected?.type && selected.type !== selectedType) {
      setSelectedType(selected.type);
    }
  }, [selected?.type, selectedType]);
  
  const { data: filteredPlansResponse, isLoading: isLoadingPlans } = useQuery({
    queryFn: () => getFilteredSubscriptionPlansList(selectedType),
    queryKey: [queryKeys.subscriptionPlans, selectedType],
    enabled: !!selectedType, // Only fetch when type is selected
  });
  const { mutateAsync: addSubscriptionPage } = useMutation({
    mutationFn: addNewSubscriptionPage,
  });
  const { mutateAsync: updateSubscriptionPage } = useMutation({
    mutationFn: updateExistingSubscriptionPage,
  });

  const initialValues = {
    title: selected?.title || '',
    slug: selected?.slug || '',
    type: selectedType,
    plans: (selected?.plans || []).map(i => i.id),
    description: selected?.description || '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    slug: Yup.string().required('Required!'),
    type: Yup.string().required('Required!'),
    plans: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least one plan is required'),
    description: Yup.string().required('Required!'),
  });

  const filteredPlansOptions = useMemo(() => {
    if (!filteredPlansResponse?.data?.data) {
      return [];
    }
    
    // Access the nested data array
    const plansArray = Array.isArray(filteredPlansResponse.data.data) 
      ? filteredPlansResponse.data.data 
      : [];
    
    return plansArray.map(plan => ({ 
      label: plan.title, 
      value: plan.id 
    }));
  }, [filteredPlansResponse?.data?.data, selectedType]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateSubscriptionPage({ payload: { id: selected.id, ...values } });
        toast.success('Subscription page updated successfully');
      } else {
        await addSubscriptionPage({ payload: { ...values } });
        toast.success('Subscription page added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.subscriptionPages, selected.id] : [queryKeys.subscriptionPages] },
      ]);
      router.push('/portal/admin/subscription/page');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Subscription Page">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField name="title" label="Title" placeholder="Title" required />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikField name="slug" label="Slug" placeholder="Slug" required />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikSelect
                  name="type"
                  label="Type"
                  placeholder="Select Type"
                  options={SUBSCRIPTION_PAGE_TYPE_OPTIONS}
                  required
                  onChange={(value) => {
                    setSelectedType(value);
                    setFieldValue('type', value);
                    setFieldValue('plans', []); // Clear selected plans when type changes
                  }}
                />
              </div>
            </div>
            <FormikMultiSelect
              name="plans"
              label="Plans"
              placeholder={isLoadingPlans ? "Loading plans..." : "Select Plans"}
              options={filteredPlansOptions}
              disabled={!selectedType || isLoadingPlans}
            />
            <FormikRichTextEditor name="description" label="Description" placeholder="Description" rows={5} required />
            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default SubscriptionPageForm;
