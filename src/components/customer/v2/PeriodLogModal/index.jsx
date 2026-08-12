'use client';

import { useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Spinner from '@/components/common/loader/Spinner';
import {
  getCustomerPeriodLogWizard,
  saveCustomerPeriodLog,
} from '@/services/private/customer/v2/home';
import queryKeys from '@/utils/query-keys';

const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50';
const BTN_OUTLINE =
  'inline-flex items-center justify-center gap-2 rounded-full border border-stroke bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray disabled:cursor-not-allowed disabled:opacity-50';

function ProgressDots({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`rounded-full transition-all ${
            index + 1 === current
              ? 'h-2.5 w-2.5 bg-primary'
              : index + 1 < current
                ? 'h-2 w-2 bg-primary/40'
                : 'h-2 w-2 bg-stone-200'
          }`}
        />
      ))}
    </div>
  );
}

function CycleMoonIcon({ optionId, icon }) {
  if (optionId === 'end') {
    return <span className="text-2xl text-stone-400">{icon}</span>;
  }

  return (
    <span className="relative flex h-10 w-10 items-center justify-center text-2xl">
      {icon}
    </span>
  );
}

function StepCycleStatus({ step, value, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-gray-900">{step.heading}</h2>
        {step.subheading ? (
          <p className="mt-2 text-sm text-gray-500">{step.subheading}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {step.options?.map(option => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 transition ${
                selected
                  ? 'border-rose-300 bg-rose-50/80'
                  : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
              }`}
            >
              <CycleMoonIcon optionId={option.id} icon={option.icon} />
              <span
                className={`text-xs font-medium ${
                  selected ? 'text-rose-700' : 'text-gray-600'
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepFlowAndPain({ step, flowValue, painValue, onFlowChange, onPainChange }) {
  const painClass = option => {
    if (painValue !== option.score) return 'border-stone-200 bg-stone-50/50';
    if (option.style_class === 'sel-r') return 'border-red-300 bg-red-50';
    if (option.style_class === 'sel-a') return 'border-amber-300 bg-amber-50';
    return 'border-primary/30 bg-primary/5';
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-gray-900">{step.heading}</h2>
        {step.subheading ? (
          <p className="mt-2 text-sm text-gray-500">{step.subheading}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {step.flow_selector?.options?.map(option => {
          const selected = flowValue === option.id;
          const size = option.size_px || 12;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onFlowChange(option.id)}
              className={`flex flex-col items-center gap-3 rounded-2xl border px-2 py-4 transition ${
                selected
                  ? 'border-rose-300 bg-rose-50/80'
                  : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
              }`}
            >
              <span
                className="rounded-full bg-rose-700"
                style={{ width: size, height: size }}
              />
              <span
                className={`text-xs font-medium ${selected ? 'text-rose-700' : 'text-gray-600'}`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <div>
        <p className="mb-3 text-center text-[11px] font-semibold tracking-[0.14em] text-gray-400">
          {step.pain_scale?.section_title}
        </p>
        <div className="grid grid-cols-5 gap-2">
          {step.pain_scale?.options?.map(option => (
            <button
              key={option.score}
              type="button"
              onClick={() => onPainChange(option.score)}
              className={`flex flex-col items-center gap-2 rounded-2xl border px-1 py-3 transition ${painClass(option)}`}
            >
              <span className="text-xl">{option.icon}</span>
              <span className="text-[11px] font-medium text-gray-700">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepSymptoms({ step, value, onChange }) {
  const toggle = id => {
    if (value.includes(id)) {
      onChange(value.filter(item => item !== id));
      return;
    }
    onChange([...value, id]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-gray-900">{step.heading}</h2>
        {step.subheading ? (
          <p className="mt-2 text-sm text-gray-500">{step.subheading}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {step.chips?.map(chip => {
          const selected = value.includes(chip.id);
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => toggle(chip.id)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                selected
                  ? 'border-rose-300 bg-rose-50/80'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  selected
                    ? 'border-rose-400 bg-rose-400 text-white'
                    : 'border-stone-300 bg-white'
                }`}
              >
                {selected ? '✓' : ''}
              </span>
              <span className="text-lg">{chip.icon}</span>
              <span className="text-sm font-medium text-gray-800">{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepSummary({ step }) {
  const insight = step.ai_insight_box;
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-gray-900">{step.heading}</h2>
        {step.subheading ? (
          <p className="mt-2 text-sm text-gray-500">{step.subheading}</p>
        ) : null}
      </div>
      {insight ? (
        <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
            <span>{insight.icon}</span>
            {insight.label}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{insight.text}</p>
        </div>
      ) : null}
    </div>
  );
}

function PeriodLogWizard({ wizard, onClose }) {
  const queryClient = useQueryClient();
  const [stepIndex, setStepIndex] = useState(0);
  const [cycleStatus, setCycleStatus] = useState('');
  const [flowIntensity, setFlowIntensity] = useState('');
  const [painScore, setPainScore] = useState(null);
  const [symptoms, setSymptoms] = useState([]);

  const stepKeys = useMemo(
    () => Object.keys(wizard?.steps || {}).sort(),
    [wizard?.steps]
  );
  const currentStepKey = stepKeys[stepIndex];
  const currentStep = wizard?.steps?.[currentStepKey];
  const totalSteps = wizard?.total_steps || stepKeys.length;
  const navigation = currentStep?.navigation || {};
  const isLastStep = stepIndex === stepKeys.length - 1;

  const painLabelByScore = useMemo(() => {
    const map = {};
    wizard?.steps?.step_2?.pain_scale?.options?.forEach(option => {
      map[option.score] = option.label?.toLowerCase();
    });
    return map;
  }, [wizard]);

  const saveMutation = useMutation({
    mutationFn: payload => saveCustomerPeriodLog(wizard.submit_url, payload),
    onSuccess: () => {
      toast.success('Cycle logged successfully.');
      queryClient.invalidateQueries({ queryKey: [queryKeys.customerV2HomeSection] });
      onClose();
    },
    onError: () => {
      toast.error('Could not save your cycle log. Please try again later.');
    },
  });

  const canGoNext = () => {
    if (stepIndex === 0) return Boolean(cycleStatus);
    if (stepIndex === 1) return Boolean(flowIntensity) && painScore != null;
    return true;
  };

  const handleNext = () => {
    if (isLastStep) {
      saveMutation.mutate({
        cycle_status: cycleStatus,
        flow_intensity: flowIntensity,
        pain_cramps_level: painLabelByScore[painScore] || '',
        symptoms,
      });
      return;
    }
    setStepIndex(index => Math.min(index + 1, stepKeys.length - 1));
  };

  const handleBack = () => {
    setStepIndex(index => Math.max(index - 1, 0));
  };

  const renderStep = () => {
    if (!currentStep) return null;
    if (stepIndex === 0) {
      return <StepCycleStatus step={currentStep} value={cycleStatus} onChange={setCycleStatus} />;
    }
    if (stepIndex === 1) {
      return (
        <StepFlowAndPain
          step={currentStep}
          flowValue={flowIntensity}
          painValue={painScore}
          onFlowChange={setFlowIntensity}
          onPainChange={setPainScore}
        />
      );
    }
    if (stepIndex === 2) {
      return <StepSymptoms step={currentStep} value={symptoms} onChange={setSymptoms} />;
    }
    return <StepSummary step={currentStep} />;
  };

  return (
    <div className="flex max-h-[90vh] flex-col bg-white">
      <div className="flex items-center justify-end px-4 pt-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stroke text-gray-500 hover:bg-gray"
          aria-label="Close"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <ProgressDots total={totalSteps} current={stepIndex + 1} />

      <div className="flex-1 overflow-y-auto px-5 py-4 md:px-8">{renderStep()}</div>

      <div className="border-t border-stroke px-5 py-4 md:px-8">
        {navigation.can_go_back && stepIndex > 0 ? (
          <div className="flex gap-3">
            <button type="button" onClick={handleBack} className={`${BTN_OUTLINE} flex-1`}>
              <FiArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext() || saveMutation.isPending}
              className={`${BTN_PRIMARY} flex-[1.4]`}
            >
              {saveMutation.isPending
                ? 'Saving…'
                : navigation.button_label || (isLastStep ? 'Save' : 'Next →')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext() || saveMutation.isPending}
            className={`${BTN_PRIMARY} w-full`}
          >
            {saveMutation.isPending ? 'Saving…' : navigation.button_label || 'Next →'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PeriodLogModal({ open, onClose, logUrl, wizardKey = 0 }) {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: [queryKeys.customerV2PeriodLogWizard, logUrl],
    queryFn: () => getCustomerPeriodLogWizard(logUrl),
    enabled: open && Boolean(logUrl),
    staleTime: 0,
  });

  const wizard = response?.data?.data;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: 'overflow-hidden rounded-t-3xl sm:rounded-3xl',
        sx: { m: { xs: 0, sm: 2 }, maxHeight: { xs: '92vh', sm: '88vh' } },
      }}
      sx={{
        zIndex: 1300,
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(28, 36, 52, 0.45)',
          backdropFilter: 'blur(4px)',
        },
        '& .MuiDialog-container': {
          alignItems: { xs: 'flex-end', sm: 'center' },
        },
      }}
    >
      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner />
        </div>
      ) : isError || !wizard ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-body">Could not load period log. Please try again later.</p>
          <button type="button" onClick={handleClose} className={BTN_OUTLINE}>
            Close
          </button>
        </div>
      ) : (
        <PeriodLogWizard key={`${logUrl}-${wizardKey}`} wizard={wizard} onClose={handleClose} />
      )}
    </Dialog>
  );
}
