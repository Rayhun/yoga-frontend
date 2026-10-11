import Spinner from '@/components/common/loader/Spinner';
import ProgramCard from './ProgramCard';

// One titled block of the catalog page: heading, sub-text and a card grid. `hideWhenEmpty` removes the
// whole section (heading included) when there is nothing to show; otherwise `emptyMessage` is shown.
const CatalogSection = ({
  title,
  subtitle,
  programs,
  isLoading = false,
  emptyMessage = '',
  hideWhenEmpty = false,
  showProgress = false,
  onOpen,
}) => {
  if (hideWhenEmpty && !isLoading && programs.length === 0) return null;

  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">{subtitle}</p>}
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : programs.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {programs.map(program => (
            <ProgramCard key={program.id} program={program} showProgress={showProgress} onClick={() => onOpen(program)} />
          ))}
        </div>
      ) : (
        <div className="w-full min-h-[200px] flex justify-center items-center text-center text-gray-500 px-4">{emptyMessage}</div>
      )}
    </section>
  );
};

export default CatalogSection;
