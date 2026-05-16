'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useQuery } from '@tanstack/react-query';

import useScrollToFirstErrorField from '@/components/common/form/formik/useScrollToFirstErrorField';
import useLmsExpertsFieldOptions, {
  expertRowToOption,
} from '@/hooks/useLmsExpertsFieldOptions';
import { getSingleExpert } from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';

/**
 * Single-select expert dropdown with server search + scroll pagination (50 per page).
 * Loads the saved expert by id when it is missing from the first results page.
 */
const ExpertField = ({
  name = 'expert',
  label = 'Expert',
  placeholder = 'Search experts…',
  Icon,
  required,
  onChange = () => {},
  disabled = false,
}) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);
  const containerRef = useScrollToFirstErrorField(name);
  const [inputSearch, setInputSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(inputSearch.trim()), 300);
    return () => window.clearTimeout(t);
  }, [inputSearch]);

  const {
    options: listOptions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useLmsExpertsFieldOptions({
    search: debouncedSearch,
    enabled: !disabled,
  });

  const normalizedValueId =
    field.value === '' || field.value === null || field.value === undefined
      ? null
      : field.value;

  const { data: selectedExpertResp, isFetching: isFetchingSelected } = useQuery({
    queryKey: [queryKeys.lmsExperts, 'field-selected', normalizedValueId],
    queryFn: () => getSingleExpert({ id: normalizedValueId }),
    enabled: Boolean(normalizedValueId),
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

  const selectedOption = useMemo(
    () => options.find(o => `${o.value}` === `${normalizedValueId}`),
    [options, normalizedValueId]
  );

  const handleChange = useCallback(
    (_, selected) => {
      const selectedValue = typeof selected === 'string' ? selected : selected?.value ?? '';
      setFieldValue(name, selectedValue === '' ? '' : selectedValue, true);
      onChange(selectedValue);
    },
    [name, onChange, setFieldValue]
  );

  const handleInputChange = useCallback((_, inputValue, reason) => {
    if (reason === 'input') {
      setInputSearch(inputValue);
    }
  }, []);

  const handleListScroll = useCallback(
    event => {
      const el = event.currentTarget;
      if (!hasNextPage || isFetchingNextPage) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const isErrorField = Boolean(meta.touched && meta.error);

  return (
    <div ref={containerRef} className="flex w-full min-w-0 flex-col gap-1">
      {label && (
        <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <Autocomplete
          fullWidth
          multiple={false}
          id={name}
          filterOptions={opts => opts}
          isOptionEqualToValue={(a, b) => `${a.value}` === `${b.value}`}
          options={options}
          getOptionLabel={option => (typeof option === 'string' ? option : option.label)}
          value={selectedOption ?? null}
          onChange={handleChange}
          onInputChange={handleInputChange}
          disabled={disabled}
          loading={isLoading || (Boolean(normalizedValueId) && isFetchingSelected) || isFetchingNextPage}
          renderInput={params => (
            <TextField {...params} placeholder={placeholder} error={isErrorField} />
          )}
          slotProps={{
            listbox: { onScroll: handleListScroll },
            paper: {
              elevation: 4,
              sx: {
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                borderWidth: '2px',
                borderColor: '#e2e8f0',
                zIndex: 1000,
              },
            },
          }}
        />
        {Icon && (
          <span className="absolute right-4 top-4">
            <Icon size={20} color="#B5BDC8" />
          </span>
        )}
      </div>

      {isErrorField ? <small className="text-xs text-red-500">{meta.error}</small> : null}
    </div>
  );
};

export default ExpertField;
