'use client';

import { useQuery } from '@tanstack/react-query';
import { FiX } from 'react-icons/fi';
import PageLoader from '@/components/common/loader/PageLoader';
import { getExpertCircleCompositionSnapshot } from '@/services/private/expert/dashboard';
import queryKeys from '@/utils/query-keys';

const BAR_OPACITIES = [1, 0.85, 0.7, 0.55, 0.4];

const CompositionBar = ({ item, barColor, shadeIndex }) => {
  const opacity = BAR_OPACITIES[shadeIndex] ?? BAR_OPACITIES[BAR_OPACITIES.length - 1];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-gray-700">{item.label}</span>
        <span className="shrink-0 font-semibold text-gray-900">{item.percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(item.percent, 4)}%`,
            backgroundColor: barColor,
            opacity,
          }}
        />
      </div>
    </div>
  );
};

const CompositionSection = ({ section }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5">
    <div className="mb-4 flex items-center gap-2">
      <span className="text-lg" aria-hidden>
        {section.icon}
      </span>
      <h3 className="font-serif text-lg font-semibold text-gray-900">{section.title}</h3>
    </div>

    {section.items?.length ? (
      <div className="space-y-4">
        {section.items.map((item, index) => (
          <CompositionBar
            key={`${section.id}-${item.value}`}
            item={item}
            barColor={section.bar_color || '#2E7D32'}
            shadeIndex={index}
          />
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-400">No data yet.</p>
    )}
  </div>
);

const CircleCompositionSnapshotModal = ({ open, onClose }) => {
  const { data, isLoading, isError } = useQuery({
    queryFn: getExpertCircleCompositionSnapshot,
    queryKey: [queryKeys.expertCircleCompositionSnapshot],
    enabled: open,
    refetchOnMount: 'always',
  });

  const snapshot = data?.data?.data;

  if (!open) return null;

  const hasData = (snapshot?.sections || []).some(section => section.items?.length > 0);

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-4 pt-10 sm:pt-16">
      <button
        type="button"
        aria-label="Close modal"
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <FiX className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="py-16">
            <PageLoader />
          </div>
        ) : isError || !snapshot ? (
          <div className="py-16 text-center">
            <h2 className="mb-2 text-lg font-semibold text-gray-800">Unable to load snapshot</h2>
            <p className="text-sm text-gray-500">Please try again in a moment.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 pr-8">
              <h2 className="font-serif text-2xl font-semibold text-gray-900 sm:text-3xl">
                {snapshot.title}
              </h2>
              {snapshot.subtitle ? (
                <p className="mt-2 text-sm text-gray-500 sm:text-[15px]">{snapshot.subtitle}</p>
              ) : null}
            </div>

            {hasData ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                {(snapshot.sections || []).map(section => (
                  <CompositionSection key={section.id} section={section} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
                <p className="text-sm text-gray-500">
                  {snapshot.empty_text ||
                    'No onboarding data yet. As members complete onboarding, their demographics will appear here.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CircleCompositionSnapshotModal;
