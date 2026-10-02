'use client';

import { LuGraduationCap, LuLightbulb, LuVideo } from 'react-icons/lu';

const METRIC_ICON_MAP = {
  lightbulb: LuLightbulb,
  video: LuVideo,
  camera: LuVideo,
  'graduation-cap': LuGraduationCap,
  graduation: LuGraduationCap,
  academic: LuGraduationCap,
};

const JoinCircleMetrics = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <div className="pt-1">
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {items.map((item, index) => {
          const Icon = METRIC_ICON_MAP[item.icon];

          return (
            <div
              key={item.label || item.value || index}
              className="flex flex-col items-center rounded-2xl bg-black/15 px-2 py-4 text-center sm:py-5"
            >
              {Icon || item.icon ? (
                <div className="relative mb-2.5 flex h-9 w-9 items-center justify-center sm:mb-3 sm:h-10 sm:w-10">
                  <span className="absolute inset-0 rounded-full bg-amber-300/25 blur-[7px]" />
                  {Icon ? (
                    <Icon className="relative h-[18px] w-[18px] text-[#E8C547] sm:h-5 sm:w-5" strokeWidth={1.75} />
                  ) : (
                    <span className="relative text-base">{item.icon}</span>
                  )}
                </div>
              ) : null}
              <p className="text-[13px] font-semibold leading-tight text-white sm:text-sm">
                {item.value}
              </p>
              <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.14em] text-white/75 sm:text-[9px]">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JoinCircleMetrics;
