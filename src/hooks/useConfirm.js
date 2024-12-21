import { forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import styled from '@emotion/styled';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@/components/common/Button';
import { CLR_PRIMARY } from '@/constants/branding';

const StyledButton = styled(Button)`
  text-transform: none !important;
  padding: 8px 15px !important;
`;

const AcceptButton = styled(StyledButton)`
  background-color: ${CLR_PRIMARY} !important;
  color: white !important;
  &:hover {
    background-color: white !important;
    color: black !important;
  }
`;

const CancelButton = styled(StyledButton)`
  background-color: white !important;
  color: black !important;
  &:hover {
    background-color: ${CLR_PRIMARY} !important;
    color: white !important;
  }
`;

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

function useConfirm() {
  const defaultArgs = { message: 'Are you sure you want to proceed?' };

  const confirm = (providedArgs = defaultArgs) => {
    const { message } = {
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

        const handleConfirm = () => {
          closeModal();
          resolve();
        };

        const handleCancel = () => {
          closeModal();
          reject();
        };

        modalRoot.render(
          <Dialog
            maxWidth="xs"
            onClose={closeModal}
            TransitionComponent={Transition}
            sx={{
              '& .MuiDialog-container': {
                alignItems: 'flex-start',
              },
            }}
            fullWidth
            open
          >
            <div className="!relative bg-gray-700 shadow">
              <IconButton className="!absolute" sx={{ top: '10px', right: '10px' }} onClick={closeModal}>
                <CloseIcon htmlColor="gray" fontSize="medium" />
              </IconButton>
              <div className="p-5 text-center">
                <ErrorOutlineIcon
                  htmlColor="#fff"
                  fontSize="large"
                  sx={{ width: '1.5em', height: '1.5em' }}
                />
                <h3 className="mb-5 text-md font-normal text-gray-400">{message}</h3>
                <Stack direction="row" justifyContent="center" spacing={1}>
                  <CancelButton onClick={handleCancel}>No, cancel</CancelButton>
                  <AcceptButton onClick={handleConfirm}>Yes, I am sure</AcceptButton>
                </Stack>
              </div>
            </div>
          </Dialog>
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  return confirm;
}

export default useConfirm;
