import { useCallback, useRef } from 'react';

/**
 * @argument {()=>{}} cb callback to execute after delay
 * @argument {number} delay callback execution delay
 */
function useDebouncedCallback(cb = () => {}, delay = 1000) {
  const timerRef = useRef(null);
  const debouncedChange = useCallback(
    (...args) => {
      // debounced
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        const timer = setTimeout(() => {
          cb(...args);
        }, delay);

        timerRef.current = timer;
        return;
      }

      const timer = setTimeout(() => {
        cb(...args);
      }, delay);

      timerRef.current = timer;
    },
    [cb, delay]
  );

  return debouncedChange;
}

export default useDebouncedCallback;
