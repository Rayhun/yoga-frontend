'use client';
import { useState, useSyncExternalStore } from 'react';
import { Modal } from '@mui/material';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/loader/Spinner';
import { describeImportError } from './csvTransfer';
import { IMPORT_STEPS, createImportController } from './importController';

const MAX_ERRORS_SHOWN = 100;
const TOUCH_TARGET = 'min-h-[44px]';
export const IMPORT_NOTICE =
  'Import only updates existing records matched by email. It never creates accounts or changes passwords.';

const Summary = ({ summary, verb }) => (
  <ul className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200" data-testid="import-summary">
    <li><strong>{summary.updated}</strong> {summary.updated === 1 ? 'row' : 'rows'} {verb}</li>
    <li><strong>{summary.unchanged}</strong> unchanged</li>
    <li><strong>{summary.errors.length}</strong> {summary.errors.length === 1 ? 'row has' : 'rows have'} errors and will be skipped</li>
  </ul>
);

const ErrorList = ({ errors }) => {
  if (errors.length === 0) return null;
  const shown = errors.slice(0, MAX_ERRORS_SHOWN).map(describeImportError);
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">Rows with errors</h3>
      <div className="max-h-56 overflow-auto rounded-lg border border-stroke dark:border-strokedark">
        <table className="w-full text-left text-xs" data-testid="import-errors">
          <thead className="sticky top-0 bg-gray-100 dark:bg-meta-4">
            <tr><th className="p-2">Row</th><th className="p-2">Email</th><th className="p-2">Problem</th></tr>
          </thead>
          <tbody>
            {shown.map(error => (
              <tr key={error.key} className="border-t border-stroke dark:border-strokedark">
                <td className="p-2">{error.row}</td>
                <td className="p-2 break-all">{error.email}</td>
                <td className="p-2">{error.field ? `${error.field}: ` : ''}{error.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {errors.length > shown.length && (
        <p className="mt-1 text-xs text-gray-500">Showing the first {shown.length} of {errors.length} errors.</p>
      )}
    </div>
  );
};

// The dialog's content for one controller state. Exported separately from the Modal so each step can be
// rendered (and tested) on its own.
export const ImportDialogBody = ({ state, onFile, onConfirm, onCancel, tabLabel }) => {
  const { step, preview, result, error, file } = state;
  const busy = step === IMPORT_STEPS.PREVIEWING || step === IMPORT_STEPS.APPLYING;

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-meta-4 dark:text-gray-200">{IMPORT_NOTICE}</p>

      {step === IMPORT_STEPS.SELECT && (
        <div className="flex flex-col gap-2">
          <label htmlFor="application-import-file" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {tabLabel} CSV file (.csv, up to 2 MB)
          </label>
          <input
            id="application-import-file"
            type="file"
            accept=".csv,text/csv"
            className={`${TOUCH_TARGET} w-full rounded-lg border border-stroke p-2 text-sm dark:border-strokedark`}
            onChange={event => onFile(event.target.files?.[0] || null)}
          />
          <p className="text-xs text-gray-500">Use a file you exported here. You will see a preview before anything is saved.</p>
        </div>
      )}

      {busy && (
        <div className="flex items-center gap-3 py-4" role="status">
          <Spinner />
          <span className="text-sm">{step === IMPORT_STEPS.PREVIEWING ? 'Checking your file…' : 'Applying changes…'}</span>
        </div>
      )}

      {(step === IMPORT_STEPS.PREVIEW) && preview && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300">Preview of <strong>{file?.name}</strong>. Nothing has been saved yet.</p>
          <Summary summary={preview} verb="will be updated" />
          <ErrorList errors={preview.errors} />
        </>
      )}

      {step === IMPORT_STEPS.DONE && result && (
        <>
          <p className="text-sm font-semibold text-green-700" role="status">Import finished.</p>
          <Summary summary={result} verb="updated" />
          <ErrorList errors={result.errors} />
        </>
      )}

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <div className="flex flex-wrap justify-end gap-3">
        {step !== IMPORT_STEPS.DONE && (
          <Button type="button" variant="secondary" className={TOUCH_TARGET} onClick={onCancel} disabled={step === IMPORT_STEPS.APPLYING}>
            Cancel
          </Button>
        )}
        {step === IMPORT_STEPS.PREVIEW && (
          <Button type="button" className={TOUCH_TARGET} onClick={onConfirm} disabled={!preview || preview.updated === 0}>
            {preview?.updated ? `Apply ${preview.updated} ${preview.updated === 1 ? 'update' : 'updates'}` : 'Nothing to apply'}
          </Button>
        )}
        {step === IMPORT_STEPS.DONE && (
          <Button type="button" className={TOUCH_TARGET} onClick={onCancel}>Close</Button>
        )}
      </div>
    </div>
  );
};

// `type` is the active tab ('qte' | 'institution'); the controller is rebuilt each time the dialog opens
// (the parent mounts it only while open), so nothing carries over between imports.
const ImportApplicationsDialog = ({ show, type, tabLabel, importFn, onApplied, onClose }) => {
  const [controller] = useState(() => createImportController({ importFn, type, onApplied }));
  const state = useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);

  const handleCancel = () => {
    if (controller.cancel()) onClose();
  };

  return (
    <Modal open={show} onClose={handleCancel} aria-labelledby="application-import-title">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50 p-4">
        <div role="dialog" aria-modal="true" aria-labelledby="application-import-title" className="max-h-full w-full max-w-xl overflow-auto rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
          <h2 id="application-import-title" className="mb-4 text-xl font-semibold">Import {tabLabel} applications</h2>
          <ImportDialogBody
            state={state}
            tabLabel={tabLabel}
            onFile={controller.chooseFile}
            onConfirm={controller.confirm}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ImportApplicationsDialog;
