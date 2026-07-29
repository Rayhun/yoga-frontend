'use client';

import { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Spinner from '@/components/common/loader/Spinner';
import {
  getCustomerCheckinWizard,
  saveCustomerCheckinLog,
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

function StepHeader({ header }) {
  if (!header?.title && !header?.subtitle) return null;
  return (
    <div className="mb-6 text-center">
      {header.title ? (
        <h2 className="font-serif text-2xl leading-snug text-gray-900 md:text-[1.65rem]">
          {header.title}
        </h2>
      ) : null}
      {header.subtitle ? (
        <p className="mt-2 text-sm text-gray-500">{header.subtitle}</p>
      ) : null}
    </div>
  );
}

function EmojiRadioGroup({ label, options, value, onChange }) {
  return (
    <div className="mb-6">
      {label ? (
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>
      ) : null}
      <div className="grid grid-cols-5 gap-2">
        {options.map(option => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition ${
                selected
                  ? 'border-amber-400 bg-amber-50 shadow-sm'
                  : 'border-stone-200/80 bg-stone-50/80 hover:border-stone-300 hover:bg-white'
              }`}
            >
              <span className="text-xl md:text-2xl">{option.icon}</span>
              <span className="text-center text-[10px] font-medium leading-tight text-gray-600 md:text-[11px]">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepSleep({ step, sleepHours, sleepQualityId, onSleepHoursChange, onSleepQualityChange }) {
  const slider = step.sleep_duration_slider;
  const quality = step.sleep_quality_selector;

  return (
    <>
      <StepHeader header={step.header} />
      {slider ? (
        <div className="mb-8 px-1">
          <input
            type="range"
            min={slider.min_value}
            max={slider.max_value}
            step={0.5}
            value={sleepHours}
            onChange={event => onSleepHoursChange(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-primary [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />
          <div className="mt-2 flex justify-between text-[11px] text-gray-400">
            {slider.labels?.map(label => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <p className="mt-4 text-center text-lg font-semibold text-primary">
            {sleepHours} {slider.unit || 'hrs'}
          </p>
        </div>
      ) : null}
      {quality ? (
        <EmojiRadioGroup
          label={quality.label}
          options={quality.options}
          value={sleepQualityId}
          onChange={onSleepQualityChange}
        />
      ) : null}
    </>
  );
}

function StepStressEnergy({ step, stressId, energyId, onStressChange, onEnergyChange }) {
  const selectors = step.selectors || [];

  return (
    <>
      <StepHeader header={step.header} />
      {selectors.map(selector => (
        <EmojiRadioGroup
          key={selector.id}
          label={selector.label}
          options={selector.options}
          value={selector.id === 'stress_level_selector' ? stressId : energyId}
          onChange={selector.id === 'stress_level_selector' ? onStressChange : onEnergyChange}
        />
      ))}
    </>
  );
}

function StepActivityWater({
  step,
  activityIds,
  waterId,
  onActivityToggle,
  onWaterChange,
}) {
  const activitySelector = step.selectors?.find(s => s.input_type === 'checkbox_group');
  const waterSelector = step.selectors?.find(s => s.input_type === 'radio_group');

  return (
    <>
      {activitySelector ? (
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold text-gray-800">{activitySelector.label}</p>
          <div className="grid grid-cols-2 gap-2.5">
            {activitySelector.options.map(option => {
              const selected = activityIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onActivityToggle(option.id)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm transition ${
                    selected
                      ? 'border-primary bg-primary/5 text-gray-900'
                      : 'border-stone-200 bg-stone-50/60 text-gray-700 hover:border-stone-300 hover:bg-white'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      selected ? 'border-primary bg-primary text-white' : 'border-stone-300 bg-white'
                    }`}
                  >
                    {selected ? <FiCheck className="h-3 w-3" /> : null}
                  </span>
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {waterSelector ? (
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-800">{waterSelector.label}</p>
          <div className="grid grid-cols-4 gap-2">
            {waterSelector.options.map(option => {
              const selected = waterId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onWaterChange(option.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 transition ${
                    selected
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-stone-200 bg-stone-50/60 hover:border-stone-300 hover:bg-white'
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-[10px] font-medium text-gray-600">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}

function StepSymptoms({ step, symptomIds, onToggle }) {
  const selector = step.symptoms_selector;
  if (!selector) return <StepHeader header={step.header} />;

  return (
    <>
      <StepHeader header={step.header} />
      <div className="grid grid-cols-2 gap-2.5">
        {selector.options.map(option => {
          const selected = symptomIds.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm transition ${
                selected
                  ? 'border-rose-300 bg-rose-50 text-gray-900'
                  : 'border-stone-200 bg-stone-50/60 text-gray-700 hover:border-stone-300 hover:bg-white'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  selected ? 'border-rose-400 bg-rose-400 text-white' : 'border-stone-300 bg-white'
                }`}
              >
                {selected ? <FiCheck className="h-3 w-3" /> : null}
              </span>
              <span className="text-lg">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepHabits({ step, habitId, onChange }) {
  const selector = step.habits_selector;
  if (!selector) return null;

  return (
    <div className="space-y-3">
      {selector.options.map(option => {
        const selected = habitId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${
              selected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-stone-200 bg-stone-50/60 hover:border-stone-300 hover:bg-white'
            }`}
          >
            <span className="text-2xl">{option.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{option.title}</p>
              {option.subtitle ? (
                <p className="mt-0.5 text-sm text-gray-500">{option.subtitle}</p>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function buildInitialFormState(wizard) {
  const slider = wizard?.steps?.step_1?.sleep_duration_slider;

  return {
    sleepHours: slider?.min_value ?? 4,
    sleepQualityId: null,
    stressId: null,
    energyId: null,
    activityIds: [],
    waterId: null,
    symptomIds: [],
    habitId: null,
  };
}

function CheckInWizard({ wizard, selectedMood, onClose }) {
  const queryClient = useQueryClient();
  const stepKeys = useMemo(
    () => Object.keys(wizard?.steps || {}).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [wizard]
  );
  const totalSteps = wizard?.total_steps || stepKeys.length;
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(() => buildInitialFormState(wizard));

  useEffect(() => {
    setForm(buildInitialFormState(wizard));
    setStepIndex(0);
  }, [wizard]);

  const currentStep = wizard?.steps?.[stepKeys[stepIndex]];
  const footer = currentStep?.footer_actions;
  const isLastStep = stepIndex === stepKeys.length - 1;

  const valueMaps = useMemo(() => {
    const maps = {
      sleepQuality: {},
      stress: {},
      energy: {},
      activity: {},
      water: {},
      symptom: {},
      habit: {},
    };

    wizard?.steps?.step_1?.sleep_quality_selector?.options?.forEach(option => {
      maps.sleepQuality[option.id] = option.value;
    });
    wizard?.steps?.step_2?.selectors?.[0]?.options?.forEach(option => {
      maps.stress[option.id] = option.value;
    });
    wizard?.steps?.step_2?.selectors?.[1]?.options?.forEach(option => {
      maps.energy[option.id] = option.value;
    });
    wizard?.steps?.step_3?.selectors?.[0]?.options?.forEach(option => {
      maps.activity[option.id] = option.value;
    });
    wizard?.steps?.step_3?.selectors?.[1]?.options?.forEach(option => {
      maps.water[option.id] = option.value;
    });
    wizard?.steps?.step_4?.symptoms_selector?.options?.forEach(option => {
      maps.symptom[option.id] = option.value;
    });
    wizard?.steps?.step_5?.habits_selector?.options?.forEach(option => {
      maps.habit[option.id] = option.value;
    });

    return maps;
  }, [wizard]);

  const saveMutation = useMutation({
    mutationFn: payload => saveCustomerCheckinLog(wizard.submit_url, payload),
    onSuccess: () => {
      toast.success('Check-in saved successfully.');
      queryClient.invalidateQueries({ queryKey: [queryKeys.customerV2HomeSection] });
      onClose();
    },
    onError: () => {
      toast.error('Could not save your check-in. Please try again later.');
    },
  });

  const toggleInList = (list, id) =>
    list.includes(id) ? list.filter(item => item !== id) : [...list, id];

  const canGoNext = () => {
    if (stepIndex === 0) return Boolean(form.sleepQualityId);
    if (stepIndex === 1) return Boolean(form.stressId && form.energyId);
    if (stepIndex === 2) return Boolean(form.waterId);
    return true;
  };

  const handleNext = () => {
    if (isLastStep) {
      saveMutation.mutate({
        mood: selectedMood
          ? {
              selected_option: selectedMood.index,
              selected_option_text: selectedMood.title,
              selected_option_emoji: selectedMood.icon,
            }
          : null,
        sleep: {
          duration_hours: form.sleepHours,
          quality: valueMaps.sleepQuality[form.sleepQualityId] || '',
        },
        metrics: {
          stress_level: valueMaps.stress[form.stressId] || '',
          energy_level: valueMaps.energy[form.energyId] || '',
        },
        lifestyle: {
          activities_today: form.activityIds.map(id => valueMaps.activity[id]).filter(Boolean),
          water_intake_group: valueMaps.water[form.waterId] || '',
        },
        symptoms: form.symptomIds.map(id => valueMaps.symptom[id]).filter(Boolean),
        habits_completed: valueMaps.habit[form.habitId] || '',
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
      return (
        <StepSleep
          step={currentStep}
          sleepHours={form.sleepHours}
          sleepQualityId={form.sleepQualityId}
          onSleepHoursChange={value => setForm(prev => ({ ...prev, sleepHours: value }))}
          onSleepQualityChange={value => setForm(prev => ({ ...prev, sleepQualityId: value }))}
        />
      );
    }
    if (stepIndex === 1) {
      return (
        <StepStressEnergy
          step={currentStep}
          stressId={form.stressId}
          energyId={form.energyId}
          onStressChange={value => setForm(prev => ({ ...prev, stressId: value }))}
          onEnergyChange={value => setForm(prev => ({ ...prev, energyId: value }))}
        />
      );
    }
    if (stepIndex === 2) {
      return (
        <StepActivityWater
          step={currentStep}
          activityIds={form.activityIds}
          waterId={form.waterId}
          onActivityToggle={id =>
            setForm(prev => ({ ...prev, activityIds: toggleInList(prev.activityIds, id) }))
          }
          onWaterChange={value => setForm(prev => ({ ...prev, waterId: value }))}
        />
      );
    }
    if (stepIndex === 3) {
      return (
        <StepSymptoms
          step={currentStep}
          symptomIds={form.symptomIds}
          onToggle={id =>
            setForm(prev => ({ ...prev, symptomIds: toggleInList(prev.symptomIds, id) }))
          }
        />
      );
    }
    return (
      <StepHabits
        step={currentStep}
        habitId={form.habitId}
        onChange={value => setForm(prev => ({ ...prev, habitId: value }))}
      />
    );
  };

  const primaryLabel = footer?.primary_button?.label || (isLastStep ? 'Done' : 'Next');
  const showBack = Boolean(footer?.back_button) && stepIndex > 0;

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
        {showBack ? (
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
              {saveMutation.isPending ? 'Saving…' : primaryLabel}
              {!saveMutation.isPending && !isLastStep ? <FiArrowRight className="h-4 w-4" /> : null}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext() || saveMutation.isPending}
            className={`${BTN_PRIMARY} w-full`}
          >
            {saveMutation.isPending ? 'Saving…' : primaryLabel}
            {!saveMutation.isPending && !isLastStep ? <FiArrowRight className="h-4 w-4" /> : null}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CheckInModal({
  open,
  onClose,
  wizardUrl,
  wizardKey = 0,
  selectedMood = null,
}) {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: [queryKeys.customerV2CheckinWizard, wizardUrl],
    queryFn: () => getCustomerCheckinWizard(wizardUrl),
    enabled: open && Boolean(wizardUrl),
    staleTime: 0,
  });

  const wizard = response?.data?.data;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          <p className="text-body">Could not load check-in. Please try again later.</p>
          <button type="button" onClick={onClose} className={BTN_OUTLINE}>
            Close
          </button>
        </div>
      ) : (
        <CheckInWizard
          key={`${wizardUrl}-${wizardKey}`}
          wizard={wizard}
          selectedMood={selectedMood}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}
