// QTE application = step 4 of the Expert profile wizard. Pure helpers (sections, device-only draft, submit)
// so they can be tested without a browser; ExpertProfileForm / QteApplicationStep wire them to the UI.

// Step 4 has 11 inputs. The client wants no more than ~6 per section, so it is paged in two sections of 6 and 5
// (the same pager as the Institution form). `fields` are the Formik field names a section owns — it is still
// ONE Formik form, so values and the submit payload never depend on the section shown.
export const QTE_APPLICATION_SECTIONS = [
  {
    id: 'about',
    title: 'About you',
    fields: ['legal_name', 'public_name', 'country', 'timezone', 'teaching_experience_years', 'prior_student_count'],
  },
  {
    id: 'materials',
    title: 'Materials & agreement',
    shortTitle: 'Materials',
    fields: ['sample_curriculum', 'sample_lecture_link', 'government_id_file', 'resume_file', 'agreement_accepted'],
  },
];
export const QTE_APPLICATION_FIELDS = QTE_APPLICATION_SECTIONS.flatMap(section => section.fields);
export const LAST_QTE_SECTION = QTE_APPLICATION_SECTIONS.length - 1;

export const QTE_DRAFT_NOTE = 'Your draft is saved on this device only. Open this page in the same browser to continue.';

/** Index of the first section that has a validation error (undefined when none). */
export const firstQteSectionWithError = errors => {
  const index = QTE_APPLICATION_SECTIONS.findIndex(section => section.fields.some(field => errors?.[field]));
  return index === -1 ? undefined : index;
};

// Step-4 starting values, seeded from the Expert row (which already holds the last submitted answers — this is
// what a rejected applicant sees prefilled on re-apply). The agreement is never pre-accepted.
export const qteInitialValues = selected => ({
  legal_name: selected?.legal_name || '',
  public_name: selected?.public_name || '',
  country: selected?.country || '',
  timezone: selected?.timezone || '',
  teaching_experience_years: selected?.teaching_experience_years || '',
  sample_curriculum: selected?.sample_curriculum || '',
  sample_lecture_link: selected?.sample_lecture_link || '',
  prior_student_count: selected?.prior_student_count || '',
  government_id_file: selected?.government_id_file || null,
  resume_file: selected?.resume_file || null,
  agreement_accepted: false,
});

export const touchedFor = fields => Object.fromEntries(fields.map(field => [field, true]));

// --- device-only draft (localStorage; never sent to the server) -----------------------------------------------

// A picked File / Blob does not survive JSON — it would come back as `{}`, which looks like "a file is there".
// Drop those (a string is an already-uploaded file key and is kept); the user re-picks the file after a restore.
const isSerializable = value => value === null || ['string', 'number', 'boolean'].includes(typeof value) || Array.isArray(value);
export const serializeDraftValues = values =>
  Object.fromEntries(Object.entries(values || {}).map(([key, value]) => [key, isSerializable(value) ? value : null]));

export const saveDraft = (storage, key, values, step) => {
  if (!storage) return;
  storage.setItem(key, JSON.stringify({ values: serializeDraftValues(values), step }));
};

export const loadDraft = (storage, key) => {
  if (!storage) return null;
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    storage.removeItem(key); // a corrupt draft is never worth a crash
    return null;
  }
};

export const clearDraft = (storage, key) => {
  if (storage) storage.removeItem(key);
};

// --- submit ---------------------------------------------------------------------------------------------------

export const buildQtePayload = (values, { governmentIdKey, resumeKey }) => ({
  legal_name: values.legal_name,
  public_name: values.public_name,
  linkedin: values.linkedin,
  country: values.country,
  timezone: values.timezone,
  teaching_experience_years: values.teaching_experience_years,
  sample_curriculum: values.sample_curriculum,
  sample_lecture_link: values.sample_lecture_link,
  prior_student_count: values.prior_student_count,
  certifications: values.certifications,
  government_id_file: governmentIdKey,
  resume_file: resumeKey,
  agreement_accepted: values.agreement_accepted,
});

/**
 * Uploads any newly picked document, sends the application, and — only once the server accepted it — clears the
 * device draft. A failure at any point throws and leaves the draft alone, so nothing typed is lost.
 * `upload({ file })` → `{ data: { file_key } }`; `apply({ payload })`; `onUploading(fieldName | null)` for the UI.
 */
export const submitQteApplication = async ({ values, upload, apply, clearDraftFn, onUploading = () => {} }) => {
  const keyFor = async field => {
    const file = values[field];
    if (typeof file === 'string') return file;
    if (!file) return null;
    onUploading(field);
    const { data } = await upload({ file });
    return data?.file_key;
  };

  try {
    const governmentIdKey = await keyFor('government_id_file');
    const resumeKey = await keyFor('resume_file');
    onUploading(null);
    await apply({ payload: buildQtePayload(values, { governmentIdKey, resumeKey }) });
  } finally {
    onUploading(null);
  }
  clearDraftFn();
};
