const PageHeader = ({ title, children }) => {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between md:gap-4">
      <h2 className="text-xl font-semibold text-black dark:text-white sm:text-title-md2">{title}</h2>

      <div className="w-full sm:w-auto">{children}</div>
    </div>
  );
};

export default PageHeader;
