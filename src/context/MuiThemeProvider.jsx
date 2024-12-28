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
        white: {
          main: '#ffffff',
          contrastText: '#000000',
        },
        dim: {
          main: '#707070',
          contrastText: '#ffffff',
        },
        gray: {
          main: colors.grey[600],
          contrastText: '#ffffff',
        },
        dimGray: {
          main: colors.grey[300],
          contrastText: '#000000',
        },
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
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
          },
        },
      },
    });
  }, [resolvedTailwindConfig.theme.colors.primary, resolvedTailwindConfig.theme.colors.secondary]);

  return (
    <ThemeProvider theme={theme} key="mui-theme">
      <CssBaseline enableColorScheme key="mui-css-baseline" />
      {children}
    </ThemeProvider>
  );
}

export default MuiThemeProvider;
