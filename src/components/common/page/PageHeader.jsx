const PageHeader = ({ title, children }) => {
  return (
    <div className="mb-6 sticky top-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">{title}</h2>

      <div>{children}</div>
    </div>
  );
};

export default PageHeader;
