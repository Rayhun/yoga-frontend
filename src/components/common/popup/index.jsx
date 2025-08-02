'use client';
import { forwardRef } from 'react';
import styled from '@emotion/styled';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import { MdClose } from 'react-icons/md';

export const StyledMainWrapper = styled.div`
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

export const StyledIconButton = styled(IconButton)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

export const StyledWrapper = styled.div`
  width: 100%;
  text-align: center;

  @media (min-width: 768px) {
    padding: 30px;
  }
`;

export const HeadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

export const Heading = styled.h3`
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: bold;
  color: black;

  @media (min-width: 640px) {
    font-size: 24px;
  }
`;

export const Separator = styled.span`
  display: block;
  margin: 0 auto 24px;
  height: 4px;
  width: 90px;
  border-radius: 2px;
  background-color: ;
`;

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const Popup = ({ size, heading = 'Popup', onClose = () => null, children, ...restProps }) => {

  return (
    <Dialog
      {...restProps}
      maxWidth={size}
      onClose={onClose}
      className="custom-modal"
      TransitionComponent={Transition}
      sx={{
        zIndex: 999,
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
        },
        '& .MuiDialog-paper': {
          overflowY: 'visible',
        },
      }}
      fullWidth
    >
      <StyledMainWrapper className="wrapper">
        <StyledIconButton onClick={onClose}>
          <MdClose color="gray" size={20} />
        </StyledIconButton>
        <StyledWrapper>
          <HeadingWrapper>
            <Heading className="heading">{heading}</Heading>
          </HeadingWrapper>
         {heading && <Separator className="bg-primary" />}
          <div>{children}</div>
        </StyledWrapper>
      </StyledMainWrapper>
    </Dialog>
  );
};

export default Popup;
