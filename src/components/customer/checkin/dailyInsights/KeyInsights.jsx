import React from 'react';
import { PiLightbulb, PiTarget, PiTrendUp, PiHeart, PiChartLine, PiStar } from 'react-icons/pi';

const KeyInsights = ({ insights }) => {
  // Handle both old and new data structures
  const getInsightCards = () => {
    if (Array.isArray(insights)) {
      // New structure: insights is an array
      return insights.map((insight, index) => ({
        factor: insight[`factor_${index + 1}`] || insight.title || `Insight ${index + 1}`,
        message: insight[`f${index + 1}_message`] || insight.message || insight.description,
        icon: [PiLightbulb, PiTarget, PiTrendUp][index] || PiLightbulb,
        bgColor: ['bg-green-100', 'bg-emerald-100', 'bg-teal-100'][index] || 'bg-green-100',
        iconColor: ['text-green-600', 'text-emerald-600', 'text-teal-600'][index] || 'text-green-600',
        borderColor: ['border-green-200', 'border-emerald-200', 'border-teal-200'][index] || 'border-green-200',
        gradientFrom: ['from-green-50', 'from-emerald-50', 'from-teal-50'][index] || 'from-green-50',
        gradientTo: ['to-emerald-50', 'to-teal-50', 'to-cyan-50'][index] || 'to-emerald-50'
      }));
    } else {
      // Old structure: insights is an object
      return [
        {
          factor: insights?.factor_1,
          message: insights?.f1_message,
          icon: PiLightbulb,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200',
          gradientFrom: 'from-green-50',
          gradientTo: 'to-emerald-50'
        },
        {
          factor: insights?.factor_2,
          message: insights?.f2_message,
          icon: PiTarget,
          bgColor: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          borderColor: 'border-emerald-200',
          gradientFrom: 'from-emerald-50',
          gradientTo: 'to-teal-50'
        },
        {
          factor: insights?.factor_3,
          message: insights?.f3_message,
          icon: PiTrendUp,
          bgColor: 'bg-teal-100',
          iconColor: 'text-teal-600',
          borderColor: 'border-teal-200',
          gradientFrom: 'from-teal-50',
          gradientTo: 'to-cyan-50'
        }
      ];
    }
  };

  const insightCards = getInsightCards();

  return (
    <div className="space-y-6">
      {insightCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div 
            key={index}
            className={`group relative bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} rounded-2xl p-6 shadow-lg border ${card.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
          >
            {/* Background Icon */}
            <div className={`absolute top-4 right-4 w-12 h-12 ${card.bgColor} rounded-full flex items-center justify-center opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
              <IconComponent className={`${card.iconColor} text-xl`} />
            </div>
            
            <div className="relative z-10 flex items-start gap-4">
              {/* Main Icon */}
              <div className={`w-12 h-12 ${card.bgColor} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className={`${card.iconColor} text-lg`} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors duration-300">
                  {card.factor || 'Key Insight'}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {card.message || 'No insight message available.'}
                </p>
              </div>
            </div>

            {/* Decorative Element */}
            <div className={`absolute bottom-2 left-2 w-2 h-2 ${card.bgColor} rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
        );
      })}
      
      {/* Empty State */}
      {insightCards.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PiStar className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Insights Available</h3>
          <p className="text-gray-600">Continue tracking your wellness to receive personalized insights.</p>
        </div>
      )}
    </div>
  );
};

export default KeyInsights;
