'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import MuiStepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { styled } from '@mui/material/styles';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { FaCheck } from "react-icons/fa";


const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#6A8E3A',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#6A8E3A',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#E5E7EB',
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: '#E5E7EB',
  zIndex: 1,
  color: '#9CA3AF',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: 24,
  fontWeight: 'bold',
  ...(ownerState.active && {
    backgroundColor: '#6A8E3A',
    color: '#fff',
  }),
  ...(ownerState.completed && {
    backgroundColor: '#6A8E3A',
    color: '#fff',
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, className, icon } = props;

  return (
    <CustomStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? <FaCheck size={22}/> : icon}
    </CustomStepIconRoot>
  );
}

const CustomStepLabel = styled(StepLabel)(({ theme }) => ({
  '& .MuiStepLabel-label': {
    marginTop: '8px',
    fontSize: '15px',
    fontWeight: 500,
    color: '#9CA3AF',
    '&.Mui-active': {
      color: '#6A8E3A',
    },
    '&.Mui-completed': {
      color: '#6A8E3A',
    },
  },
}));

const steps = [
  { label: 'Sign Up' },
  { label: 'Verify Email' },
  { label: 'Verify Number' },
];

const Stepper = ({ activeStep = 1 }) => {
  const muiActiveStep = activeStep - 1;
  
  return (
    <Box sx={{ width: '100%', pb: 4 }}>
      <MuiStepper
        alternativeLabel
        activeStep={muiActiveStep}
        connector={<CustomConnector />}
      >
        {steps.map((step, index) => (
          <Step key={step.label}>
            <CustomStepLabel StepIconComponent={CustomStepIcon}>
              {step.label}
            </CustomStepLabel>
          </Step>
        ))}
      </MuiStepper>
    </Box>
  );
};

export default Stepper;