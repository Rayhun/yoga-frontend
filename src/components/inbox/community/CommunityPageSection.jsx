'use client';

import { DEFAULT_COMMUNITY_COLORS, getCommunityColor } from './communityColors';
import SharingCardSection from './SharingCardSection';
import MetricsGridSection from './MetricsGridSection';

const OrderedListSection = ({ steps = [], section }) => {
  const sortedSteps = [...steps].sort(
    (a, b) => (a.step_number ?? 0) - (b.step_number ?? 0)
  );

  if (!sortedSteps.length) return null;

  const backgroundColor = getCommunityColor(
    section?.background_color,
    DEFAULT_COMMUNITY_COLORS.sectionBackground
  );
  const stepNumberColor = getCommunityColor(
    section?.steps_number_color,
    DEFAULT_COMMUNITY_COLORS.stepNumber
  );
  const stepTextColor = getCommunityColor(section?.steps_text_color, undefined);

  return (
    <div
      className="rounded-2xl px-5 py-5 md:px-6 md:py-6"
      style={{ backgroundColor }}
    >
      <ol className="space-y-4">
        {sortedSteps.map((step, index) => {
          const stepNumber = step.step_number ?? index + 1;
          const key = step.step_id || `step-${stepNumber}`;

          return (
            <li key={key} className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: stepNumberColor }}
              >
                {stepNumber}
              </span>
              <span
                className="pt-0.5 text-left text-sm leading-relaxed text-gray-700 md:text-base"
                style={stepTextColor ? { color: stepTextColor } : undefined}
              >
                {step.text}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const CommunityPageSection = ({ section }) => {
  if (!section) return null;

  switch (section.card_type) {
    case 'ordered_list':
      return <OrderedListSection steps={section.steps} section={section} />;
    case 'sharing_card':
      return <SharingCardSection section={section} />;
    case 'metrics_grid':
      return <MetricsGridSection section={section} />;
    default:
      return null;
  }
};

export default CommunityPageSection;
