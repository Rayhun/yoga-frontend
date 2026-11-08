/** The responsive 1 / 2 / 4 column grid the portal dashboards put their KPI tiles in. */
const StatGrid = ({ children }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
);

export default StatGrid;
