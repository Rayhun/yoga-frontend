// Pure helpers for the Certification Applications CSV import / export / Add New (no React, no I/O).
import { extractApiErrorMessage } from '@/utils/helpers';

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024; // the backend refuses anything larger
export const MAX_IMPORT_ROWS = 2000;

// --- client-side file check (the backend repeats it) -------------------------------------------------

// Returns an error message, or null when the file may be sent. Judged by extension, not MIME type:
// Windows/Excel reports .csv as application/vnd.ms-excel.
export const validateCsvFile = file => {
  if (!file || typeof file.name !== 'string') return 'Please choose a CSV file.';
  if (!file.name.toLowerCase().endsWith('.csv')) return 'Only .csv files are accepted.';
  if (!file.size) return 'The file is empty.';
  if (file.size > MAX_IMPORT_BYTES) return 'The file is larger than 2 MB.';
  return null;
};

// --- import report -------------------------------------------------------------------------------------

// The backend returns { status, message, data: { updated, unchanged, skipped, errors: [{row,email,field,code,message}], ... } }.
export const summarizeImport = report => ({
  totalRows: report?.total_rows ?? 0,
  updated: report?.updated ?? 0,
  unchanged: report?.unchanged ?? 0,
  skipped: report?.skipped ?? 0,
  errors: Array.isArray(report?.errors) ? report.errors : [],
  unknownColumns: report?.unknown_columns ?? [],
  ignoredColumns: report?.ignored_columns ?? [],
});

// One line of the error list.
export const describeImportError = error => ({
  key: `${error.row}-${error.field || 'row'}-${error.code}`,
  row: error.row,
  email: error.email || '(no email)',
  field: error.field || null,
  message: error.message,
});

// --- Add New --------------------------------------------------------------------------------------------

export const NEW_QTE_REQUIRED_FIELDS = ['email', 'first_name', 'last_name'];
export const NEW_QTE_OPTIONAL_FIELDS = ['legal_name', 'public_name', 'country', 'timezone'];

// Backend 400s come as { status, message, data: { field: ['msg'] } } (validation) or { message, data: '' }
// (for example "An account already exists with this email address."). Returns { fieldErrors, message }.
export const fieldErrorsFrom400 = error => {
  const body = error?.response?.data;
  if (error?.response?.status !== 400 || !body) return { fieldErrors: {}, message: extractApiErrorMessage(error) };
  const fieldErrors = {};
  if (body.data && typeof body.data === 'object') {
    for (const [field, value] of Object.entries(body.data)) {
      fieldErrors[field] = Array.isArray(value) ? value.join(' ') : String(value);
    }
  }
  if (Object.keys(fieldErrors).length === 0 && /email/i.test(body.message || '')) fieldErrors.email = body.message;
  return { fieldErrors, message: body.message || 'Could not create the record.' };
};

// The 201 body is the table row plus { email_sent, message }.
export const splitCreateResponse = data => {
  const { email_sent: emailSent, message, ...row } = data || {};
  return { row, emailSent: emailSent !== false, message: message || '' };
};

// Runs the create call and reports what the UI should do. Never throws for API errors.
export const submitNewQte = async ({ createFn, values }) => {
  const payload = Object.fromEntries(
    [...NEW_QTE_REQUIRED_FIELDS, ...NEW_QTE_OPTIONAL_FIELDS]
      .map(field => [field, typeof values[field] === 'string' ? values[field].trim() : values[field]])
      .filter(([field, value]) => NEW_QTE_REQUIRED_FIELDS.includes(field) || value)
  );
  try {
    const response = await createFn(payload);
    return { ok: true, ...splitCreateResponse(response?.data) };
  } catch (error) {
    return { ok: false, ...fieldErrorsFrom400(error) };
  }
};

// The list query caches the axios response ({ data: [...] }); put the new row first without a refetch.
export const addRowToCache = (cached, row) => {
  if (!cached || !Array.isArray(cached.data)) return cached;
  return { ...cached, data: [row, ...cached.data.filter(existing => existing.id !== row.id)] };
};
