const FormLayoutWrapper = ({ title, children }) => {
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6.5">
        <h3 className="font-medium text-black dark:text-white">{title}</h3>
      </div>
      <div className="p-4 sm:p-6.5">{children}</div>
    </div>
  );
};

export default FormLayoutWrapper;
