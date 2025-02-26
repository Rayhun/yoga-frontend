import { forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import styled from '@emotion/styled';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import { MdClose } from 'react-icons/md';

const StyledMainWrapper = styled.div`
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const StyledIconButton = styled(IconButton)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const StyledWrapper = styled.div`
  width: 100%;
  text-align: center;

  @media (min-width: 768px) {
    padding: 30px;
  }
`;

const HeadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

const Heading = styled.h3`
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: bold;
  color: black;

  @media (min-width: 640px) {
    font-size: 24px;
  }
`;

const Separator = styled.span`
  display: block;
  margin: 0 auto 24px;
  height: 4px;
  width: 90px;
  border-radius: 2px;
  background-color: #007bff;
`;

const Message = styled.p`
  margin-bottom: 40px;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
`;

const StyledButton = styled.button`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

function useConfirm() {
  const defaultArgs = { heading: 'Confirmation!!!', message: 'Are you sure you want to proceed?' };

  const confirm = (providedArgs = defaultArgs) => {
    const { heading, message } = {
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
              zIndex: 9999,
              '& .MuiDialog-container': {
                alignItems: 'flex-start',
              },
            }}
            fullWidth
            open
          >
            <StyledMainWrapper>
              <StyledIconButton onClick={closeModal}>
                <MdClose color="gray" size={20} />
              </StyledIconButton>
              <StyledWrapper>
                <HeadingWrapper>
                  <Heading>{heading}</Heading>
                </HeadingWrapper>
                <Separator />
                <Message>{message}</Message>
                <ButtonGroup>
                  <StyledButton className="btn-cancel" fullWidth onClick={handleCancel}>
                    No, Cancel
                  </StyledButton>
                  <StyledButton className="btn-primary" fullWidth onClick={handleConfirm}>
                    Yes, Proceed
                  </StyledButton>
                </ButtonGroup>
              </StyledWrapper>
            </StyledMainWrapper>
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
