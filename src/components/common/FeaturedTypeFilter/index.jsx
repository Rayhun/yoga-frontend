'use client';
import { FiCheck } from 'react-icons/fi';

const FeaturedTypeFilter = ({ items = [], selected = [], setSelected = () => null }) => {

  const onSelect = item => {
    setSelected(prev => {
      const itemIndex = prev.indexOf(item);
      if (itemIndex >= 0) {
        const newSelected = [...prev];
        newSelected.splice(itemIndex, 1);
        return newSelected;
      } else {
        return [...prev, item];
      }
    });
  };

  const isAllSelected = selected.length === 0;

  return (
    <div className="w-full flex gap-2.5 justify-center overflow-auto no-scrollbar pb-2">
      <button
        className={`group relative text-xs md:text-sm font-medium text-nowrap cursor-pointer px-4 py-2 md:px-5 md:py-2.5 rounded-xl transition-all duration-200 ${
          isAllSelected
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 border-2 border-emerald-400'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
        }`}
        onClick={() => setSelected([])}
      >
        All
        {isAllSelected && (
          <FiCheck className="inline-block ml-1.5 w-4 h-4" />
        )}
      </button>
      {items.map((item, index) => {
        const isSelected = selected.includes(item);
        return (
          <button
            key={`${item}-${index}`}
            className={`group relative text-xs md:text-sm font-medium capitalize text-nowrap cursor-pointer px-4 py-2 md:px-5 md:py-2.5 rounded-xl transition-all duration-200 ${
              isSelected
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 border-2 border-emerald-400'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            }`}
            onClick={() => onSelect(item)}
          >
            {item}
            {isSelected && (
              <FiCheck className="inline-block ml-1.5 w-4 h-4" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FeaturedTypeFilter;
