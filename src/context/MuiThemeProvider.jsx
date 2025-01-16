'use client';
import { useMemo } from 'react';
import { CssBaseline, ThemeProvider, colors, createTheme } from '@mui/material';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

function MuiThemeProvider({ children }) {
  const resolvedTailwindConfig = useMemo(() => resolveConfig(tailwindConfig), []);

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        primary: {
          main: resolvedTailwindConfig.theme.colors.primary,
        },
        secondary: {
          main: resolvedTailwindConfig.theme.colors.secondary,
        },
      },
      typography: {
        fontFamily: 'Satoshi, sans-serif',
      },
      components: {
        MuiStack: {
          defaultProps: {
            direction: 'row',
            gap: 1,
          },
        },
        MuiMenu: {
          defaultProps: {
            transitionDuration: 300,
          },
        },
        MuiTextField: {
          defaultProps: {
            variant: 'outlined',
            classes: {
              root: 'dark:text-white',
            },
          },
        },
        MuiAutocomplete: {
          defaultProps: {
            classes: {
              input: 'font-satoshi font-weight-[400] dark:text-white',
              root: 'dark:bg-form-input',
              clearIndicator: 'dark:text-white',
              popupIndicator: 'dark:text-white',
            },
          },
          styleOverrides: {
            root: {
              // Default style
              '.MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: resolvedTailwindConfig.theme.colors['stroke'],
                },
                '&:hover fieldset': {
                  borderColor: resolvedTailwindConfig.theme.colors['stroke'],
                },
                '&.Mui-error fieldset': {
                  borderColor: 'red',
                },
              },
              // For Dark Theme
              '.dark & .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: resolvedTailwindConfig.theme.colors['form-strokedark'],
                },
                '&:hover fieldset': {
                  borderColor: resolvedTailwindConfig.theme.colors['form-strokedark'],
                },
                '&.Mui-focused fieldset': {
                  borderColor: resolvedTailwindConfig.theme.colors.primary,
                },
                '&.Mui-error fieldset': {
                  borderColor: 'red',
                },
              },
            },
            listbox: {
              '.dark &': {
                backgroundColor: resolvedTailwindConfig.theme.colors['body'],
                '& li': {
                  color: 'white',
                },
              },
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            root: {
              zIndex: 9999,
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            root: {
              borderBottom: `1px solid ${resolvedTailwindConfig.theme.colors.bodydark1}`,
              '.dark &': {
                borderBottom: `1px solid ${resolvedTailwindConfig.theme.colors.meta['4']}`,
              },
            },
            indicator: {
              height: '3px',
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              '.dark &': {
                color: 'white',
              },
              '&.Mui-selected': {
                backgroundColor: resolvedTailwindConfig.theme.colors.meta['2'],
              },
              '.dark &.Mui-selected': {
                backgroundColor: resolvedTailwindConfig.theme.colors.meta['4'],
              },
            },
          },
        },
      },
    });
  }, [resolvedTailwindConfig.theme.colors]);

  return (
    <ThemeProvider theme={theme} key="mui-theme">
      <CssBaseline enableColorScheme key="mui-css-baseline" />
      {children}
    </ThemeProvider>
  );
}

export default MuiThemeProvider;
