'use client';

const TOTAL_SEGMENTS = 3;

const JoinOnboardProgressBar = ({ activeStep = 1 }) => (
  <div className="flex gap-2">
    {Array.from({ length: TOTAL_SEGMENTS }).map((_, index) => {
      const stepNumber = index + 1;
      const isActive = stepNumber <= activeStep;

      return (
        <div
          key={stepNumber}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
            isActive ? 'bg-[#1E4D35]' : 'bg-[#C8E6D4]'
          }`}
        />
      );
    })}
  </div>
);

export default JoinOnboardProgressBar;
