// `headerContent` (replaces the title) and `headerAside` (right-aligned) are optional; without them
// the header renders exactly as it always has.
const FormLayoutWrapper = ({ title, headerContent, headerAside, children }) => {
  const heading = headerContent ?? <h3 className="font-medium text-black dark:text-white">{title}</h3>;

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6.5">
        {headerAside ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {heading}
            {headerAside}
          </div>
        ) : (
          heading
        )}
      </div>
      <div className="p-4 sm:p-6.5">{children}</div>
    </div>
  );
};

export default FormLayoutWrapper;
