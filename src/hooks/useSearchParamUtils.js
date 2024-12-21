'use client';
import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function useSearchParamUtils({ replace } = { replace: true }) {
  const path = usePathname();
  const router = useRouter();
  const search = useSearchParams();

  const set = useCallback(
    (key = '', value = '') => {
      const params = new URLSearchParams(search?.toString());

      if (value) params.set(key, value);
      else params.delete(key);

      const newPath = `${path}?${params?.toString()}`;

      replace ? router.replace(newPath) : router.push(newPath);
    },
    [search, router, path, replace]
  );

  const setAll = useCallback(
    paramsObject => {
      const params = new URLSearchParams(search?.toString());

      Object.entries(paramsObject).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      const newPath = `${path}?${params?.toString()}`;

      replace ? router.replace(newPath) : router.push(newPath);
    },
    [search, router, path, replace]
  );

  const get = useCallback((key = '') => search.get(key), [search]);

  const getAll = useCallback(() => search.getAll(), [search]);

  const remove = useCallback(
    (key = '') => {
      const params = new URLSearchParams(search?.toString());
      params.delete(key);
      const newPath = `${path}?${params?.toString()}`;

      replace ? router.replace(newPath) : router.push(newPath);
    },
    [search, router, path, replace]
  );

  const removeAll = useCallback(() => {
    replace ? router.replace(path) : router.push(path);
  }, [router, path, replace]);

  return { get, getAll, set, setAll, remove, removeAll };
}

export default useSearchParamUtils;
