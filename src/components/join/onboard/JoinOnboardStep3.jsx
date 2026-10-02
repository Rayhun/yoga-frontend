'use client';

import {
  ONBOARD_PRIMARY_BUTTON_CLASS,
  ONBOARD_SUBTITLE_CLASS,
  ONBOARD_TITLE_CLASS,
} from './onboardStyles';

const JoinOnboardStep3 = ({ stepData, onEnterCircle, isSubmitting }) => (
  <div className="flex w-full flex-1 flex-col items-center lg:items-stretch">
    {stepData?.celebration_icon ? (
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F0E8] text-3xl">
        {stepData.celebration_icon}
      </div>
    ) : null}

    <div className="mb-6 w-full sm:mb-8">
      <h1 className={ONBOARD_TITLE_CLASS}>{stepData?.header?.title}</h1>
      {stepData?.header?.subtitle ? (
        <p className={ONBOARD_SUBTITLE_CLASS}>{stepData.header.subtitle}</p>
      ) : null}
    </div>

    <div className="w-full space-y-3">
      {(stepData?.preview_cards || []).map(card => (
        <div
          key={card.id}
          className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 text-left shadow-sm"
        >
          {card.icon ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F0E8] text-lg">
              {card.icon}
            </span>
          ) : null}
          <div>
            <p className="text-sm font-semibold text-gray-900">{card.title}</p>
            {card.description ? (
              <p className="mt-0.5 text-sm text-gray-500">{card.description}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>

    {stepData?.reminder_banner?.text ? (
      <div className="mt-5 w-full rounded-xl border border-[#F5D78E] bg-[#FFF8E7] px-4 py-3.5 text-left text-sm leading-relaxed text-[#6B5B3E]">
        {stepData.reminder_banner.icon ? (
          <span className="mr-1.5">{stepData.reminder_banner.icon}</span>
        ) : null}
        {stepData.reminder_banner.text}
      </div>
    ) : null}

    <div className="mt-auto w-full pt-8 sm:pt-10">
      <button
        type="button"
        onClick={onEnterCircle}
        disabled={isSubmitting}
        className={ONBOARD_PRIMARY_BUTTON_CLASS}
      >
        {isSubmitting
          ? 'Loading...'
          : stepData?.footer_actions?.primary_button?.label || 'Enter Circle'}
      </button>
    </div>
  </div>
);

export default JoinOnboardStep3;
