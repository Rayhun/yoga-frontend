'use client';

import { useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import { usePortalDarkMode } from './PortalSelect';

/**
 * Multi-select with debounced server search (portal styling).
 * `value` / `onChange` use `{ value, label }[]`; options are merged so chips stay labeled.
 */
export default function PortalMultiSearchSelect({
  id,
  value = [],
  onChange,
  loadOptions,
  placeholder = 'Type to search…',
  disabled = false,
  minChars = 1,
  noOptionsText = 'No matches',
  className = '',
}) {
  const theme = useTheme();
  const isDark = usePortalDarkMode();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedLoad = useMemo(
    () =>
      debounce(async query => {
        if (!query || String(query).trim().length < minChars) {
          setAsyncOptions([]);
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const opts = await loadOptions(String(query).trim());
          setAsyncOptions(Array.isArray(opts) ? opts : []);
        } catch {
          setAsyncOptions([]);
        } finally {
          setLoading(false);
        }
      }, 320),
    [loadOptions, minChars]
  );

  useEffect(() => () => debouncedLoad.cancel(), [debouncedLoad]);

  const mergedOptions = useMemo(() => {
    const map = new Map();
    asyncOptions.forEach(o => map.set(o.value, o));
    (value || []).forEach(o => map.set(o.value, o));
    return [...map.values()];
  }, [asyncOptions, value]);

  const border = isDark ? '#3d4d60' : '#e2e8f0';
  const paperBorder = isDark ? '#2e3a47' : '#e2e8f0';
  const inputBg = isDark ? '#1d2a39' : '#ffffff';

  return (
    <Autocomplete
      id={id}
      multiple
      disableCloseOnSelect
      className={className}
      disabled={disabled}
      loading={loading}
      options={mergedOptions}
      value={value}
      onChange={(_, next) => onChange(next)}
      filterOptions={opts => opts}
      filterSelectedOptions={false}
      isOptionEqualToValue={(a, b) => a?.value === b?.value}
      getOptionLabel={option => option?.label ?? ''}
      noOptionsText={noOptionsText}
      onInputChange={(_, inputValue, reason) => {
        if (reason === 'reset') return;
        debouncedLoad(inputValue || '');
      }}
      popupIcon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="text-bodydark2">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      slotProps={{
        paper: {
          elevation: 4,
          sx: {
            borderRadius: '12px',
            border: `2px solid ${paperBorder}`,
            boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.08)',
            mt: 0.5,
            overflow: 'hidden',
            backgroundColor: isDark ? '#24303f' : '#ffffff',
            '& .MuiAutocomplete-listbox': {
              py: 0.75,
              px: 0.5,
              maxHeight: 280,
            },
            '& .MuiAutocomplete-option': {
              fontSize: '0.875rem',
              minHeight: '40px',
              borderRadius: '10px',
              margin: '2px 0',
              color: isDark ? '#f1f5f9' : '#1c2434',
            },
            '& .MuiAutocomplete-option.Mui-focused': {
              backgroundColor: isDark ? 'rgba(0, 100, 0, 0.22)' : 'rgba(0, 100, 0, 0.09)',
            },
            '& .MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
              backgroundColor: isDark ? 'rgba(0, 100, 0, 0.3)' : 'rgba(0, 100, 0, 0.14)',
            },
            '& .MuiAutocomplete-option[aria-selected="true"]': {
              backgroundColor: isDark ? 'rgba(0, 100, 0, 0.26)' : 'rgba(0, 100, 0, 0.11)',
              fontWeight: 600,
            },
          },
        },
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.value}
            label={option.label}
            size="small"
            className="!rounded-lg !text-xs dark:!border-strokedark dark:!bg-meta-4 dark:!text-white"
            sx={{
              backgroundColor: isDark ? 'rgba(0, 100, 0, 0.22)' : 'rgba(0, 100, 0, 0.1)',
              borderColor: isDark ? '#3d4d60' : '#e2e8f0',
            }}
            variant="outlined"
          />
        ))
      }
      renderInput={params => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              minHeight: 42,
              alignItems: 'flex-start',
              paddingTop: '6px',
              paddingBottom: '6px',
              backgroundColor: inputBg,
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              '& fieldset': {
                borderColor: border,
              },
              '&:hover fieldset': {
                borderColor: isDark ? '#4a5f75' : '#cbd5e1',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: '1px',
              },
            },
            '& .MuiOutlinedInput-input': {
              py: '8px',
              fontSize: '0.875rem',
              color: isDark ? '#ffffff' : '#1c2434',
            },
          }}
        />
      )}
    />
  );
}
