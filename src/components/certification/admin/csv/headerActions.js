// Builds the table header buttons (shared PageHeaderQuickActions shape: { id, label, Icon, onClick, ... }).
import { BiImport } from 'react-icons/bi';
import { MdOutlineAdd } from 'react-icons/md';

// Same 44px touch target for all three buttons.
const TOUCH_TARGET = 'min-h-[44px]';

// Buttons exist only for Admin accounts (the endpoints reject everyone else, Staff included) and
// "Add New" only on the QTE tab: there is no admin create flow for Institutions.
export const buildHeaderActions = ({ isAdmin, tabKey, isExporting, isImporting = false, onImport, onExport, onAddNew }) => {
  if (!isAdmin) return [];
  return [
    { id: 'import', Icon: BiImport, label: 'Import', onClick: onImport, isLoading: isImporting, className: TOUCH_TARGET },
    { id: 'export', label: 'Export', onClick: onExport, isLoading: isExporting, className: TOUCH_TARGET },
    ...(tabKey === 'qte'
      ? [{ id: 'add', Icon: MdOutlineAdd, label: 'Add New', onClick: onAddNew, className: TOUCH_TARGET }]
      : []),
  ];
};

// Export the ACTIVE tab, with the table's status filter (the backend supports both; the table has no search).
// `download` is downloadBlobAsCsv, `onError` the error toast: injected so the flow is testable.
export const createExportHandler = ({ exportFn, download, onError, setBusy = () => null }) => async ({ type, status }) => {
  setBusy(true);
  try {
    const response = await exportFn({ type, status });
    download(response, `certification_${type}_applications.csv`);
    return true;
  } catch (error) {
    onError(error);
    return false;
  } finally {
    setBusy(false);
  }
};
