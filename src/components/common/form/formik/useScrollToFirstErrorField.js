'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFormikContext } from 'formik';

const isObject = value => value && typeof value === 'object' && !Array.isArray(value);

const getFirstErrorPath = (errors, parentPath = '') => {
  if (!errors) return null;

  if (typeof errors === 'string') {
    return parentPath || null;
  }

  if (Array.isArray(errors)) {
    for (let i = 0; i < errors.length; i += 1) {
      const childPath = parentPath ? `${parentPath}.${i}` : `${i}`;
      const found = getFirstErrorPath(errors[i], childPath);
      if (found) return found;
    }
    return null;
  }

  if (isObject(errors)) {
    const keys = Object.keys(errors);
    for (const key of keys) {
      const childPath = parentPath ? `${parentPath}.${key}` : key;
      const found = getFirstErrorPath(errors[key], childPath);
      if (found) return found;
    }
  }

  return null;
};

const useScrollToFirstErrorField = (fieldName) => {
  const containerRef = useRef(null);
  const { errors, submitCount } = useFormikContext();

  const firstErrorPath = useMemo(() => getFirstErrorPath(errors), [errors]);
  const isFirstErrorField = firstErrorPath === fieldName;

  useEffect(() => {
    if (!submitCount || !isFirstErrorField || !containerRef.current) return;

    containerRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    const inputEl =
      containerRef.current.querySelector(`[name="${fieldName}"]`) ||
      containerRef.current.querySelector('input, textarea, select, button');

    if (inputEl && typeof inputEl.focus === 'function') {
      inputEl.focus({ preventScroll: true });
    }
  }, [fieldName, isFirstErrorField, submitCount]);

  return containerRef;
};

export default useScrollToFirstErrorField;
