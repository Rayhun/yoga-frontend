const DetailsLayoutWrapper = ({ title, children, onEdit, customActions }) => {
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex justify-between items-center">
        <h3 className="font-medium text-black dark:text-white">{title}</h3>
        <div className="flex items-center gap-2">
          {customActions}
          {onEdit && (
            <button
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-1 text-sm text-center font-medium text-white hover:bg-opacity-90"
              onClick={onEdit}
            >
              Edit
            </button>
          )}
        </div>
      </div>
      <div className="p-6.5">{children}</div>
    </div>
  );
};

export default DetailsLayoutWrapper;
