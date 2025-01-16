'use client';
import { forwardRef, cloneElement } from 'react';
import { createRoot } from 'react-dom/client';
import styled from '@emotion/styled';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import { MdErrorOutline, MdClose } from 'react-icons/md';
import MuiThemeProvider from '@/context/MuiThemeProvider';
import UIProvider from '@/context/UIProvider';

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

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

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
              <Dialog
                maxWidth={size}
                className="custom-modal"
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
                <StyledMainWrapper className="wrapper">
                  <StyledIconButton onClick={closeModal}>
                    <MdClose color="gray" size={20} />
                  </StyledIconButton>
                  <StyledWrapper>
                    <HeadingWrapper>
                      <Heading className="heading">{heading}</Heading>
                    </HeadingWrapper>
                    <Separator />
                    <div>
                      {cloneElement(content, {
                        done,
                      })}
                    </div>
                  </StyledWrapper>
                </StyledMainWrapper>
              </Dialog>
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
