// A labelled pill group ("Price: Any / Free / Paid", "Level: Any / Beginner / ..."), styled exactly like
// TrackFilterPills. Controlled by the caller (the URL), so the selection survives a reload and can be shared.
// "Any" has the empty value: choosing it removes the param.
const CatalogFilterPills = ({ label, options, selected = '', onSelect }) => (
  <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2 md:gap-3">
    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
    {options.map(option => {
      const isSelected = selected === option.value;
      return (
        <button
          key={option.value || 'any'}
          type="button"
          aria-pressed={isSelected}
          onClick={() => onSelect(option.value)}
          className={`min-h-[44px] px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-primary border-primary text-white'
              : 'bg-white border-gray-300 text-gray-600 hover:border-primary hover:text-primary dark:bg-boxdark dark:border-strokedark dark:text-gray-300'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default CatalogFilterPills;
