'use client';
import { useState } from 'react';

const ITEMS = [
  { label: 'Yoga', key: 'yoga' },
  { label: 'Sleep', key: 'sleep' },
  { label: 'Anxiety', key: 'anxiety' },
  { label: 'Meditation', key: 'meditation' },
  { label: 'Stress Relief', key: 'stress' },
  { label: 'Mindfulness', key: 'mindfulness' },
  { label: 'Breathing', key: 'breathing' },
  { label: 'Relaxation', key: 'relaxation' },
  { label: 'Wellness', key: 'wellness' },
  { label: 'Fitness', key: 'fitness' },
  { label: 'Nutrition', key: 'nutrition' },
  { label: 'Mental Health', key: 'mental-health' },
];

const QuickLinks = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (item) => {
    setSelectedItem(selectedItem === item.key ? null : item.key);
    console.log('Selected:', item.label);
  };

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
      {ITEMS.map((item, index) => (
        <button
          key={`${item.key}-${index}`}
          onClick={() => handleItemClick(item)}
          className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
            selectedItem === item.key
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:from-teal-600 hover:to-cyan-600' 
              : 'bg-white/80 backdrop-blur-sm text-teal-700 border-2 border-teal-200 hover:border-teal-300 hover:bg-white hover:shadow-md'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default QuickLinks;
