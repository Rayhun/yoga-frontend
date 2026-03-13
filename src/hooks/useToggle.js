'use client';
import { useCallback, useState } from 'react';

function useToggle() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(state => setIsOpen(prevState => state ?? !prevState), []);

  return { isOpen, toggle, setIsOpen };
}

export default useToggle;
