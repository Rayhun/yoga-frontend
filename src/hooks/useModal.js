'use client';
import { forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const useModal =
  () =>
  (providedArgs = {}) => {
    const { content } = providedArgs;

    const modalDiv = document.createElement('div');
    document.body.appendChild(modalDiv);

    const modalRoot = createRoot(modalDiv);

    const closeModal = () => {
      modalRoot.unmount();
      document.body.removeChild(modalDiv);
    };

    modalRoot.render(
      <Dialog
        open
        maxWidth="xs"
        onClose={closeModal}
        TransitionComponent={Transition}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'flex-start',
          },
        }}
        fullWidth
      >
        {content}
      </Dialog>
    );
  };

export default useModal;
