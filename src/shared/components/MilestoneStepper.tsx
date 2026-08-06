import { Step, StepLabel, Stepper } from '@mui/material';

interface MilestoneStepperProps {
  steps: readonly string[];
  activeStep: number;
}

export default function MilestoneStepper({ steps, activeStep }: MilestoneStepperProps) {
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
