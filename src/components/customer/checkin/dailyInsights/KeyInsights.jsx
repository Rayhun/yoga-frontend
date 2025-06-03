import React from 'react';
import { FaRegHeart } from 'react-icons/fa';

const insights = [
  {
    title: 'Energy peak pattern',
    description:
      'Your energy consistently peaks 2–3 hours after waking up. Schedule important tasks during this window',
  },
  {
    title: 'Social connection impact',
    description:
      'Your energy consistently peaks 2–3 hours after waking up. Schedule important tasks during this window',
  },
  {
    title: 'Social connection impact',
    description:
      'Your energy consistently peaks 2–3 hours after waking up. Schedule important tasks during this window',
  },
];

const KeyInsights = ({ insights }) => {
  return (
    <div className="">
      <h2 className="text-lg font-semibold mb-4">Key Insights</h2>
      <div className="space-y-4">
          <div className="flex items-start space-x-4 bg-white p-4 rounded-lg shadow-md border">
            {/* Icon */}
            <div className="bg-orange-100 p-2 rounded-full">
              <FaRegHeart className="text-orange-500" />
            </div>

            {/* Text Content */}
            <div>
              <h3 className="text-sm font-semibold text-black">{insights?.factor_1}</h3>
              <p className="text-sm text-gray-600">{insights?.f1_message}</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 bg-white p-4 rounded-lg shadow-md border">
            {/* Icon */}
            <div className="bg-orange-100 p-2 rounded-full">
              <FaRegHeart className="text-orange-500" />
            </div>

            {/* Text Content */}
            <div>
              <h3 className="text-sm font-semibold text-black">{insights?.factor_2}</h3>
              <p className="text-sm text-gray-600">{insights?.f2_message}</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 bg-white p-4 rounded-lg shadow-md border">
            {/* Icon */}
            <div className="bg-orange-100 p-2 rounded-full">
              <FaRegHeart className="text-orange-500" />
            </div>

            {/* Text Content */}
            <div>
              <h3 className="text-sm font-semibold text-black">{insights?.factor_3}</h3>
              <p className="text-sm text-gray-600">{insights?.f3_message}</p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default KeyInsights;
