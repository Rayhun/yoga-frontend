'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import Spinner from '@/components/common/Spinner';
import tailwindConfig from '../../tailwind.config';

const initialState = {
  isLoading: true,
  theme: {},
  setIsLoading: () => null,
};

export const UIContext = createContext(initialState);

export const useUI = () => useContext(UIContext);

function UIProvider({ children }) {
  const [isLoading, setIsLoading] = useState(initialState.isLoading);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const resolvedTailwindConfig = useMemo(() => resolveConfig(tailwindConfig), []);

  return (
    <UIContext.Provider value={{ isLoading, setIsLoading, theme: resolvedTailwindConfig.theme }}>
      {isLoading ? (
        <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
          <Spinner size={60} />
        </div>
      ) : (
        children
      )}
    </UIContext.Provider>
  );
}

export default UIProvider;
