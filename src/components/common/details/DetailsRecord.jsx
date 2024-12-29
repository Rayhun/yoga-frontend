const DetailsRecord = ({ label, children }) => {
  return (
    <div className="flex gap-5 items-center">
      <h5 className="text-black dark:text-white font-bold w-1/3">{label}</h5>
      <p className="text-black dark:text-white w-2/3">{children}</p>
    </div>
  );
};

export default DetailsRecord;
