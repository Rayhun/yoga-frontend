'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import Button from '@/components/common/Button';
import useLmsExpertsFieldOptions, { expertRowToOption } from '@/hooks/useLmsExpertsFieldOptions';
import {
  createHomeCoachConfig,
  updateHomeCoachConfig,
} from '@/services/private/lms/home-coach';
import queryKeys from '@/utils/query-keys';
import { toastApiError } from '@/utils/helpers';

const HomeCoachForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pickedExpertOptions, setPickedExpertOptions] = useState(() =>
    (selected?.experts || []).map(expert => expertRowToOption(expert)).filter(Boolean)
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPickedExpertOptions(
      (selected?.experts || []).map(expert => expertRowToOption(expert)).filter(Boolean)
    );
  }, [selected?.experts]);

  const {
    options: expertOptions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingExperts,
    isFetching: isFetchingExperts,
  } = useLmsExpertsFieldOptions({
    search: debouncedSearch,
    enabled: true,
  });

  const mergedExpertOptions = useMemo(() => {
    const byId = new Map(expertOptions.map(option => [option.value, option]));
    pickedExpertOptions.forEach(option => {
      if (!byId.has(option.value)) {
        byId.set(option.value, option);
      }
    });
    return Array.from(byId.values());
  }, [expertOptions, pickedExpertOptions]);

  const handleExpertSearchChange = useCallback((_, value, reason) => {
    // Ignore MUI "reset" when options refresh so typed text is not cleared.
    if (reason === 'input' || reason === 'clear') {
      setSearchInput(value);
    }
  }, []);

  const handleExpertsChange = useCallback(raw => {
    setSearchInput('');
    setPickedExpertOptions(prev => {
      const byId = new Map(prev.map(option => [option.value, option]));
      raw.forEach(item => {
        if (item?.value == null) return;
        byId.set(item.value, typeof item === 'string' ? { label: item, value: item } : item);
      });
      const selectedIds = new Set(
        raw.map(item => (typeof item === 'string' ? item : item?.value)).filter(v => v != null)
      );
      return Array.from(byId.values()).filter(option => selectedIds.has(option.value));
    });
  }, []);

  const { mutateAsync: addHomeCoachConfig } = useMutation({
    mutationFn: createHomeCoachConfig,
  });

  const { mutateAsync: updateHomeCoachConfigMutation } = useMutation({
    mutationFn: updateHomeCoachConfig,
  });

  const initialValues = {
    experts: (selected?.experts || []).map(expert => expert.id),
    is_active: selected?.is_active ?? true,
  };

  const validationSchema = Yup.object({
    experts: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'Select at least one expert'),
    is_active: Yup.boolean(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateHomeCoachConfigMutation({ id: selected.id, ...values });
        toast.success('Home coach configuration updated successfully');
      } else {
        await addHomeCoachConfig(values);
        toast.success('Home coach configuration created successfully');
      }

      await queryClient.invalidateQueries([queryKeys.homeCoachConfigs]);
      router.push('/portal/admin/lms/expert/home-coach');
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
    <FormLayoutWrapper title="Home Coach Configuration">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <FormikMultiSelect
              name="experts"
              label="Experts"
              placeholder="Search experts..."
              options={mergedExpertOptions}
              inputValue={searchInput}
              loading={isLoadingExperts || isFetchingExperts || isFetchingNextPage}
              required
              filterOptionsLocally={false}
              onInputChange={handleExpertSearchChange}
              onChange={handleExpertsChange}
              disableCloseOnSelect
              infiniteScroll={{
                hasMore: Boolean(hasNextPage),
                isLoadingMore: isFetchingNextPage,
                onFetchMore: fetchNextPage,
              }}
            />

            <div className="w-full xl:w-1/2">
              <FormikSwitch
                name="is_active"
                label="Active"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="2xl"
                className="self-start"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default HomeCoachForm;
