import { MONTHLY_GOAL_TYPES } from '@/utils/constants';

const GoalCategories = ({selected, setSelected}) => {

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

  return (
    <div className="overflow-x-auto flex gap-2 no-scrollbar">
      {MONTHLY_GOAL_TYPES.map((category, index) => (
        <div
          key={`${category.name}-${index}`}
          className={`text-xs md:text-sm border  text-nowrap cursor-pointer px-2 py-1 md:px-4 md:py-2 rounded-full ${
            selected.includes(category.value)
              ? 'bg-primary border-primary text-white'
              : 'text-gray-400 border-gray-400'
          }`}
          onClick={() => onSelect(category.value)}
        >
          {category.name}
        </div>
      ))}
    </div>
  );
};

export default GoalCategories;
