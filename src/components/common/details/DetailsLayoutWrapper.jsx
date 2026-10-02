const DetailsLayoutWrapper = ({
  title,
  children,
  onEdit,
  onDelete,
  isDeleting = false,
  customActions,
}) => {
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-col gap-3 border-b border-stroke px-4 py-4 dark:border-strokedark sm:flex-row sm:items-center sm:justify-between sm:px-6.5">
        <h3 className="font-medium text-black dark:text-white">{title}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {customActions}
          {onDelete && (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-red-500 px-4 py-1 text-sm text-center font-medium text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-60"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
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
      <div className="p-4 sm:p-6.5">{children}</div>
    </div>
  );
};

export default DetailsLayoutWrapper;
