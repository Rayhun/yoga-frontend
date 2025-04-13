'use client';
import { cloneElement, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import MuiThemeProvider from '@/context/MuiThemeProvider';
import UIProvider from '@/context/UIProvider';
import Popup from '@/components/common/popup';

function useModal () {
  const defaultArgs = {
    heading: 'Confirmation!!!',
    content: '',
    size: 'xs',
  };

  // Use ref to store closure-safe reference
  const modalRef = useRef({
    close: null,
    root: null,
    container: null,
  });

  const closeCurrentModal = () => {
    if (modalRef.current.close) {
      modalRef.current.close();
      modalRef.current.close = null;
      modalRef.current.root = null;
      modalRef.current.container = null;
    }
  };

  const render = (providedArgs = defaultArgs) => {

    closeCurrentModal();

    const { heading, content, size } = {
      ...defaultArgs,
      ...providedArgs,
    };

    return new Promise((resolve, reject) => {
      try {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);

        const close = () => {
          root.unmount();
          document.body.removeChild(container);
          resolve(); // Resolve when closing
          modalRef.current.close = null;
        };

        modalRef.current = { close, root, container };

        const done = () => close();

        root.render(
          <MuiThemeProvider>
            <UIProvider initialLoading={false}>
              <Popup size={size} heading={heading} onClose={close} open>
                {cloneElement(content, { done })}
              </Popup>
            </UIProvider>
          </MuiThemeProvider>
        );
      } catch (error) {
        reject(error);
        modalRef.current.close = null;
      }
    });
  };

  return {
    render,
    closeModal: () => modalRef.current.close?.(),
  };
}

export default useModal;
