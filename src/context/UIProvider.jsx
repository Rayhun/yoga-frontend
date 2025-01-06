'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import FullScreenLoader from '@/components/common/loader/FullScreenLoader';
import tailwindConfig from '../../tailwind.config';

const initialState = {
  isLoading: true,
  theme: {},
  setIsLoading: () => null,
};

export const UIContext = createContext(initialState);

export const useUI = () => useContext(UIContext);

function UIProvider({ initialLoading = initialState.isLoading, children }) {
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const resolvedTailwindConfig = useMemo(() => resolveConfig(tailwindConfig), []);

  return (
    <UIContext.Provider value={{ isLoading, setIsLoading, theme: resolvedTailwindConfig.theme }}>
      {isLoading ? <FullScreenLoader /> : children}
    </UIContext.Provider>
  );
}

export default UIProvider;
