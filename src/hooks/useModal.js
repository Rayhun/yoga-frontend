'use client';
import { cloneElement } from 'react';
import { createRoot } from 'react-dom/client';
import MuiThemeProvider from '@/context/MuiThemeProvider';
import UIProvider from '@/context/UIProvider';
import Popup from '@/components/common/popup';

function useModal() {
  const defaultArgs = { heading: 'Confirmation!!!', content: '', size: 'xs' };

  const render = (providedArgs = defaultArgs) => {
    const { heading, content, size } = {
      ...defaultArgs,
      ...providedArgs,
    };
    return new Promise((resolve, reject) => {
      try {
        const modalDiv = document.createElement('div');
        document.body.appendChild(modalDiv);

        const modalRoot = createRoot(modalDiv);

        const closeModal = () => {
          modalRoot.unmount();
          document.body.removeChild(modalDiv);
        };

        const done = () => {
          closeModal();
          resolve();
        };

        modalRoot.render(
          <MuiThemeProvider>
            <UIProvider initialLoading={false}>
              <Popup size={size} heading={heading} onClose={closeModal} open>
                {cloneElement(content, {
                  done,
                })}
              </Popup>
            </UIProvider>
          </MuiThemeProvider>
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  return render;
}

export default useModal;
