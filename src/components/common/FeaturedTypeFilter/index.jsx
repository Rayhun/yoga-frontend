'use client';
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

  return (
    <div className="w-full flex gap-3 justify-center overflow-auto no-scrollbar">
      <div
        className={`text-xs md:text-sm border text-nowrap cursor-pointer px-2 py-1 md:px-4 md:py-2 rounded-full ${
          selected.length === 0 ? 'bg-primary border-primary text-white' : 'text-gray-400 border-gray-400'
        }`}
        onClick={() => setSelected([])}
      >
        All
      </div>
      {items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className={`text-xs md:text-sm border capitalize text-nowrap cursor-pointer px-2 py-1 md:px-4 md:py-2 rounded-full ${
            selected.includes(item) ? 'bg-primary border-primary text-white' : 'text-gray-400 border-gray-400'
          }`}
          onClick={() => onSelect(item)}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export default FeaturedTypeFilter;
