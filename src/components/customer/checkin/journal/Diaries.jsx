import React from 'react';
import { FaRegHeart } from 'react-icons/fa';

const cards = [
  {
    date: 'Monday, May 5, 2025.',
    message:
      'Your energy consistently peaks 2-3 hours after waking up. Schedule important tasks during this window',
  },
  {
    date: 'Monday, May 5, 2025.',
    message:
      'Your energy consistently peaks 2-3 hours after waking up. Schedule important tasks during this window',
  },
  {
    date: 'Monday, May 5, 2025.',
    message:
      'Your energy consistently peaks 2-3 hours after waking up. Schedule important tasks during this window',
  }
];

const PastDiaries = () => {
  return (
    <div>
      <h4 className="text-xl text-dark font-semibold">Past Diaries</h4>
      <div className="space-y-4 p-6 max-h-[500px] overflow-y-auto">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 flex gap-3 items-start">
            <div className="text-orange-400 mt-1 bg-orange-100 rounded-full p-1">
              <FaRegHeart size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">{card.date}</p>
              <p className="text-gray-700">{card.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PastDiaries;
