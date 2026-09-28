'use client';
import React, { useRef } from 'react';
import { FiCheck } from 'react-icons/fi';

/**
 * Clickable two-step indicator in the builder card's header. Rendered as a tablist (each step's
 * panel stays mounted, only hidden — see ProgramBuilderModal), with roving focus: ←/→ move between
 * enabled steps, Home/End jump to the ends, Enter/Space selects.
 *
 * `steps`: [{ id, label, panelId, disabled?, disabledReason?, done? }]
 */
const BuilderStepper = ({ steps, currentStep, onSelect }) => {
  const buttonRefs = useRef({});
  const enabledSteps = steps.filter(step => !step.disabled);

  const focusStep = step => {
    buttonRefs.current[step.id]?.focus();
    onSelect(step.id);
  };

  const handleKeyDown = (event, step) => {
    const index = enabledSteps.findIndex(item => item.id === step.id);
    const last = enabledSteps.length - 1;
    const targets = {
      ArrowRight: enabledSteps[Math.min(index + 1, last)],
      ArrowLeft: enabledSteps[Math.max(index - 1, 0)],
      Home: enabledSteps[0],
      End: enabledSteps[last],
    };
    const target = targets[event.key];
    if (!target) return;
    event.preventDefault();
    focusStep(target);
  };

  return (
    <div role="tablist" aria-label="Program builder steps" className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
      {steps.map((step, index) => {
        const isCurrent = step.id === currentStep;
        return (
          <React.Fragment key={step.id}>
            {index > 0 ? <span aria-hidden className="hidden h-px w-6 bg-stroke dark:bg-strokedark sm:block md:w-12" /> : null}
            <button
              ref={node => {
                buttonRefs.current[step.id] = node;
              }}
              type="button"
              role="tab"
              id={`${step.panelId}-tab`}
              aria-controls={step.panelId}
              aria-selected={isCurrent}
              tabIndex={isCurrent ? 0 : -1}
              disabled={step.disabled}
              title={step.disabled ? step.disabledReason : undefined}
              onClick={() => onSelect(step.id)}
              onKeyDown={event => handleKeyDown(event, step)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${
                isCurrent ? 'text-black dark:text-white' : 'text-body hover:text-primary'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  isCurrent
                    ? 'border-primary bg-primary text-white'
                    : step.done
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-stroke text-body dark:border-strokedark'
                }`}
              >
                {step.done && !isCurrent ? <FiCheck size={14} aria-hidden /> : index + 1}
              </span>
              <span className="whitespace-nowrap">
                <span className="sr-only">
                  Step {index + 1} of {steps.length}:{' '}
                </span>
                {step.label}
              </span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BuilderStepper;
