'use client';

import { useMemo, useSyncExternalStore } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';

function subscribeDarkClass(callback) {
  if (typeof document === 'undefined') return () => {};
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function getDarkClassSnapshot() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export function usePortalDarkMode() {
  return useSyncExternalStore(subscribeDarkClass, getDarkClassSnapshot, () => false);
}

/**
 * Single-select dropdown styled for the portal (matches inputs / FormikSelect menus).
 * Prefer this over native &lt;select&gt; for consistent UX.
 */
export default function PortalSelect({
  id,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  disableClearable = true,
  className = '',
}) {
  const theme = useTheme();
  const isDark = usePortalDarkMode();

  const selected = useMemo(() => options.find(o => o.value === value) ?? null, [options, value]);

  const border = isDark ? '#3d4d60' : '#e2e8f0';
  const paperBorder = isDark ? '#2e3a47' : '#e2e8f0';
  const inputBg = isDark ? '#1d2a39' : '#ffffff';

  return (
    <Autocomplete
      id={id}
      fullWidth
      className={className}
      options={options}
      disabled={disabled}
      disableClearable={disableClearable}
      value={selected}
      onChange={(_, newOption) => {
        if (newOption != null) {
          onChange(newOption.value);
        } else if (!disableClearable) {
          onChange('');
        }
      }}
      getOptionLabel={option => option?.label ?? ''}
      isOptionEqualToValue={(a, b) => a?.value === b?.value}
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
      renderInput={params => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              minHeight: 42,
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
              py: '10px',
              fontSize: '0.875rem',
              color: isDark ? '#ffffff' : '#1c2434',
            },
          }}
        />
      )}
    />
  );
}
