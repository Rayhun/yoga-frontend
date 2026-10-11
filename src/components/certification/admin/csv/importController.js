// The import dialog's state machine, kept free of React so its rules can be tested directly:
//
//   select -> previewing -> preview -> applying -> done
//
// - choosing a file runs a DRY RUN only (nothing is written);
// - the real import runs only from `confirm()` on a preview that has rows to update;
// - `cancel()` at any point before applying discards everything and sends nothing;
// - an in-flight apply cannot be cancelled (the request can't be aborted), so `cancel()` refuses.
import { extractApiErrorMessage } from '@/utils/helpers';
import { summarizeImport, validateCsvFile } from './csvTransfer';

export const IMPORT_STEPS = {
  SELECT: 'select',
  PREVIEWING: 'previewing',
  PREVIEW: 'preview',
  APPLYING: 'applying',
  DONE: 'done',
};

const initialState = () => ({ step: IMPORT_STEPS.SELECT, file: null, preview: null, result: null, error: null });

export const createImportController = ({ importFn, type, onApplied = () => {} }) => {
  let state = initialState();
  let runId = 0; // a response that arrives after cancel/reset is ignored
  const listeners = new Set();

  const set = patch => {
    state = { ...state, ...patch };
    listeners.forEach(listener => listener());
  };

  const chooseFile = async file => {
    const problem = validateCsvFile(file);
    if (problem) {
      set({ error: problem });
      return;
    }
    const id = ++runId;
    set({ step: IMPORT_STEPS.PREVIEWING, file, preview: null, error: null });
    try {
      const response = await importFn({ type, file, dryRun: true });
      if (id !== runId) return;
      set({ step: IMPORT_STEPS.PREVIEW, preview: summarizeImport(response?.data?.data) });
    } catch (error) {
      if (id !== runId) return;
      set({ ...initialState(), error: extractApiErrorMessage(error) });
    }
  };

  const confirm = async () => {
    if (state.step !== IMPORT_STEPS.PREVIEW || !state.file || state.preview.updated === 0) return;
    const id = ++runId;
    set({ step: IMPORT_STEPS.APPLYING, error: null });
    try {
      const response = await importFn({ type, file: state.file, dryRun: false });
      if (id !== runId) return;
      const result = summarizeImport(response?.data?.data);
      set({ step: IMPORT_STEPS.DONE, result });
      onApplied(result);
    } catch (error) {
      if (id !== runId) return;
      set({ step: IMPORT_STEPS.PREVIEW, error: extractApiErrorMessage(error) });
    }
  };

  const cancel = () => {
    if (state.step === IMPORT_STEPS.APPLYING) return false;
    runId += 1;
    state = initialState();
    listeners.forEach(listener => listener());
    return true;
  };

  return {
    chooseFile,
    confirm,
    cancel,
    getState: () => state,
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};
