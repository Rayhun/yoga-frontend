'use client';

import { getCtaClassName } from '@/utils/customer-v2-relief';
import { RELIEF_CARD, RELIEF_CARD_HOVER, RELIEF_SECTION_LABEL } from './shared';

function CycleTrackerSection({ section }) {
  const data = section.data || {};
  const phases = data.phases_timeline || [];
  const activePhase = phases.find(phase => phase.is_active);

  return (
    <section className={`${RELIEF_CARD} overflow-hidden`}>
      <div className="relative bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 p-6 text-white md:p-7 lg:p-8 xl:p-10">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <p className={`relative ${RELIEF_SECTION_LABEL} text-white/60`}>{section.title}</p>
        <div className="relative mt-5 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur-sm">
            {data.phase_icon}
          </span>
          <div>
            <h3 className="text-xl font-bold md:text-2xl">{data.current_phase_name}</h3>
            <p className="mt-0.5 text-sm text-white/75">{data.progress_indicator_text}</p>
          </div>
        </div>

        <div className="relative mt-6 space-y-2">
          <div className="flex gap-1.5">
            {phases.map(phase => (
              <div key={phase.id} className="flex-1 space-y-1.5">
                <div
                  className={`h-2.5 rounded-full transition ${
                    phase.is_active ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-transparent' : 'opacity-60'
                  }`}
                  style={{ backgroundColor: phase.color_hex }}
                  title={phase.label}
                />
                <p
                  className={`truncate text-center text-[10px] font-medium ${
                    phase.is_active ? 'text-white' : 'text-white/50'
                  }`}
                >
                  {phase.label}
                </p>
              </div>
            ))}
          </div>
          {activePhase ? (
            <p className="text-center text-xs text-white/60">
              {data.days_remaining_in_cycle} days remaining in cycle
            </p>
          ) : null}
        </div>

        {data.action_button ? (
          <button
            type="button"
            className="relative mt-6 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            {data.action_button.label}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function SymptomsSection({ section }) {
  return (
    <section className={`${RELIEF_CARD} p-5 md:p-6`}>
      <p className={RELIEF_SECTION_LABEL}>{section.title}</p>
      <div className="mt-5 space-y-4">
        {(section.symptoms || []).map(symptom => (
          <div
            key={symptom.id}
            className="rounded-xl border border-stone-100 bg-gradient-to-r from-stone-50/80 to-white p-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                {symptom.icon}
              </span>
              <span className="font-semibold text-gray-900">{symptom.label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(symptom.options || []).map(option => {
                const isSelected = option.id === symptom.selected_option_id;
                return (
                  <span
                    key={option.id}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-stone-200 bg-white text-gray-600'
                    }`}
                  >
                    {option.label}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HabitsSection({ section }) {
  const goalCard = section.monthly_goal_card;
  const progress = goalCard?.progress || {};

  return (
    <section className="space-y-4">
      <p className={RELIEF_SECTION_LABEL}>{section.title}</p>

      {goalCard ? (
        <div className={`${RELIEF_CARD} overflow-hidden`}>
          <div className="border-b border-stone-100 bg-gradient-to-r from-primary/5 to-emerald-50/50 px-5 py-4">
            <h3 className="font-bold text-gray-900">{goalCard.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{goalCard.description}</p>
          </div>
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-2xl font-bold text-primary">{progress.display_text}</span>
              <span className="text-gray-500">{progress.helper_text}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-600 transition-all duration-500"
                style={{ width: `${progress.percentage_value || 0}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:gap-5">
        {(section.daily_habits || []).map(habit => {
          const isCompleted = habit.status === 'COMPLETED';
          return (
            <article
              key={habit.id}
              className={`${RELIEF_CARD_HOVER} flex items-center gap-4 p-4 md:p-5 ${
                isCompleted ? 'border-emerald-200/80 bg-emerald-50/30' : ''
              }`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                  isCompleted ? 'bg-emerald-100' : 'bg-stone-100'
                }`}
              >
                {habit.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900">{habit.title}</h4>
                <p className={`text-sm ${isCompleted ? 'text-emerald-700' : 'text-gray-500'}`}>
                  {habit.subtitle}
                </p>
              </div>
              {habit.cta ? (
                <button type="button" className={getCtaClassName(habit.cta.style_variant)}>
                  {habit.cta.label}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function TrackTab({ data }) {
  const sections = data?.sections || [];

  return (
    <div className="space-y-6 lg:space-y-8">
      {sections.map(section => {
        if (section.card_type === 'cycle_phase_overview') {
          return <CycleTrackerSection key={section.section_id} section={section} />;
        }
        if (section.card_type === 'symptom_intensity_selector') {
          return <SymptomsSection key={section.section_id} section={section} />;
        }
        if (section.card_type === 'habits_and_goals_list') {
          return <HabitsSection key={section.section_id} section={section} />;
        }
        return null;
      })}
    </div>
  );
}
