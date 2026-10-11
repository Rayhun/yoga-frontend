import { TRACK_FILTERS } from './catalogModel';

// "All Tracks / Clinical / Coaching & Practice / Foundational". Controlled by the caller (the URL),
// so the selection survives a reload and can be shared. Pills wrap on narrow screens and are 44px tall.
const TrackFilterPills = ({ selected = '', onSelect }) => (
  <div role="group" aria-label="Track type" className="flex flex-wrap gap-2 md:gap-3">
    {TRACK_FILTERS.map(filter => {
      const isSelected = selected === filter.value;
      return (
        <button
          key={filter.value || 'all'}
          type="button"
          aria-pressed={isSelected}
          onClick={() => onSelect(filter.value)}
          className={`min-h-[44px] px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-primary border-primary text-white'
              : 'bg-white border-gray-300 text-gray-600 hover:border-primary hover:text-primary dark:bg-boxdark dark:border-strokedark dark:text-gray-300'
          }`}
        >
          {filter.label}
        </button>
      );
    })}
  </div>
);

export default TrackFilterPills;
