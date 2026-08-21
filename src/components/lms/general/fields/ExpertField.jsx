'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useField } from 'formik';
import { useQuery } from '@tanstack/react-query';
import FormikSingleOptionModalField from '@/components/common/form/formik/FormikSingleOptionModalField';
import useLmsExpertsFieldOptions, { expertRowToOption } from '@/hooks/useLmsExpertsFieldOptions';
import { getSingleExpert } from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';

/**
 * Single-select expert picker with server search + scroll pagination (same modal UI as categories).
 */
const ExpertField = ({
  name = 'expert',
  label = 'Expert',
  placeholder = 'Select expert',
  required,
  onChange = () => {},
  disabled = false,
}) => {
  const [field] = useField(name);
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const normalizedValueId =
    field.value === '' || field.value === null || field.value === undefined ? null : field.value;

  const {
    options: listOptions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useLmsExpertsFieldOptions({
    search: debouncedSearch,
    enabled: !disabled && (open || Boolean(normalizedValueId)),
  });

  const { data: selectedExpertResp, isFetching: isFetchingSelected } = useQuery({
    queryKey: [queryKeys.lmsExperts, 'field-selected', normalizedValueId],
    queryFn: () => getSingleExpert({ id: normalizedValueId }),
    enabled: Boolean(normalizedValueId),
    throwOnError: false,
  });

  const selectedOptionFromDetail = useMemo(() => {
    const row = selectedExpertResp?.data?.data;
    return row ? expertRowToOption(row) : null;
  }, [selectedExpertResp]);

  const options = useMemo(() => {
    const byId = new Map(listOptions.map(o => [o.value, o]));
    if (selectedOptionFromDetail?.value != null && !byId.has(selectedOptionFromDetail.value)) {
      byId.set(selectedOptionFromDetail.value, selectedOptionFromDetail);
    }
    return Array.from(byId.values());
  }, [listOptions, selectedOptionFromDetail]);

  const handleListScroll = useCallback(
    e => {
      const el = e.currentTarget;
      if (!hasNextPage || isFetchingNextPage) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  return (
    <FormikSingleOptionModalField
      name={name}
      label={label}
      required={required}
      disabled={disabled}
      options={options}
      modalTitle="Select expert"
      searchPlaceholder="Search experts…"
      triggerPlaceholder={placeholder}
      onChange={onChange}
      loading={isLoading || (Boolean(normalizedValueId) && isFetchingSelected)}
      loadError={isError}
      onListScroll={handleListScroll}
      isFetchingNextPage={isFetchingNextPage}
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      filterOptionsLocally={false}
      onOpenChange={setOpen}
    />
  );
};

export default ExpertField;
