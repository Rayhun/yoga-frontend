/* eslint-disable react/no-unescaped-entities */
'use client';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';

import { useState } from 'react';
import { PiLightbulb, PiTarget, PiTrendUp, PiHeart, PiStar } from 'react-icons/pi';
import { getRecommendations } from '@/services/private/ai_insight';

const CARD_STYLES = [
  {
    icon: PiLightbulb,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200',
    gradientFrom: 'from-green-50',
    gradientTo: 'to-emerald-50',
  },
  {
    icon: PiTarget,
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    gradientFrom: 'from-emerald-50',
    gradientTo: 'to-teal-50',
  },
  {
    icon: PiTrendUp,
    bgColor: 'bg-teal-100',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    gradientFrom: 'from-teal-50',
    gradientTo: 'to-cyan-50',
  },
  {
    icon: PiHeart,
    bgColor: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    gradientFrom: 'from-cyan-50',
    gradientTo: 'to-blue-50',
  },
];

const AiInsightCard = ({ insight }) => {
  const [dismissedCards, setDismissedCards] = useState([]);

  const { data, isLoading, error } = useQuery({
    queryKey: [queryKeys.recommendations, insight],
    queryFn: () => getRecommendations(insight),
    enabled: !!insight,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        Failed to load recommendations. Please try again.
      </div>
    );
  }

  const guides = data?.data?.guides || [];

  const visibleGuides = guides.filter((_, index) => !dismissedCards.includes(index));

  if (visibleGuides.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PiStar className="text-gray-400 text-2xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Insights Available</h3>
        <p className="text-gray-600">Continue tracking your wellness to receive personalized insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {visibleGuides.map((guide, index) => {
        const actualIndex = guides.indexOf(guide);
        const styleIndex = index % CARD_STYLES.length;
        const cardStyle = CARD_STYLES[styleIndex];
        const IconComponent = cardStyle.icon;

        return (
          <div
            key={guide.id}
            className={`group relative bg-gradient-to-br ${cardStyle.gradientFrom} ${cardStyle.gradientTo} rounded-2xl p-6 shadow-lg border ${cardStyle.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className="relative z-10 flex items-start gap-4">
              <div
                className={`w-12 h-12 ${cardStyle.bgColor} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
              >
                {guide.tracker_icon ? (
                  <span className="text-2xl">{guide.tracker_icon}</span>
                ) : (
                  <IconComponent className={`${cardStyle.iconColor} text-lg`} />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-gray-900 transition-colors duration-300">
                  {guide.title}
                </h3>
                {guide.tracker_title && <p className="text-xs text-gray-500 mb-2">{guide.tracker_title}</p>}
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {guide.description || 'No insight message available.'}
                </p>
              </div>
            </div>

            <div
              className={`absolute bottom-2 left-2 w-2 h-2 ${cardStyle.bgColor} rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

export default AiInsightCard;
