'use client';
import FormikField from '@/components/common/form/formik/FormikField';
import { lessonContentKind, lessonUrlHelp, pageLinkWarning, validateLessonUrl } from './lessonMedia';
import { URL_LABELS } from './lessonTypes';

const BUTTON =
  'min-h-[44px] rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark';

// The file's name inside its storage key.
const fileNameOf = key => (typeof key === 'string' ? key.split('/').pop() : '');

/**
 * The link input for a video / audio / image lesson (content hosted elsewhere: the creator pastes a public https
 * link). The https rules are checked here as the creator types (same as the server's), shown under the field.
 *
 * A lesson that already has a file uploaded earlier shows "Uploaded file in use" instead: the file keeps working
 * and is kept on every save until the creator chooses "Replace with a link". `onChange(patch)` is the lesson
 * pane's normal change handler, so the replacement is autosaved like any edit.
 */
const LessonUrlField = ({ namePrefix, lessonType, title, value, previewUrl, disabled = false, onChange }) => {
  const label = URL_LABELS[lessonType];

  if (lessonContentKind(value) === 'file') {
    return (
      <div className="flex flex-col gap-3" data-testid="uploaded-file-in-use">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label} — <span className="text-primary">Uploaded file in use</span>
        </p>
        {previewUrl ? (
          lessonType === 'audio' ? (
            <audio controls preload="metadata" src={previewUrl} aria-label={`Preview of ${title || 'the lesson'} audio`} className="w-full" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- a signed, expiring storage URL, not a Next-optimised asset
            <img src={previewUrl} alt={title ? `${title} (preview)` : 'Lesson image preview'} className="max-h-64 max-w-full rounded-lg border border-gray-200 object-contain dark:border-strokedark" />
          )
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">File: {fileNameOf(value)}</p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300">
          This lesson plays a file you uploaded earlier, and it stays as it is when you save. To use a link instead, replace it.
        </p>
        <div>
          <button type="button" className={BUTTON} disabled={disabled} onClick={() => onChange({ content_url: '', signed_content_url: '' })}>
            Replace with a link
          </button>
        </div>
      </div>
    );
  }

  const problem = validateLessonUrl(value);
  const warning = pageLinkWarning(lessonType, value); // advisory only: saving is still allowed
  const helpId = `${namePrefix}-content-url-help`;
  return (
    <div className="flex flex-col gap-2">
      <FormikField
        name={`${namePrefix}.content_url`}
        label={label}
        placeholder="https://"
        inputMode="url"
        autoComplete="off"
        aria-describedby={helpId}
        aria-invalid={Boolean(problem)}
        disabled={disabled}
      />
      <p id={helpId} className="text-xs text-gray-500">
        {lessonUrlHelp(lessonType)}
      </p>
      {problem ? (
        <p role="alert" className="text-sm text-red-600">
          {problem}
        </p>
      ) : warning ? (
        <p role="note" className="text-sm text-amber-600">
          {warning}
        </p>
      ) : null}
    </div>
  );
};

export default LessonUrlField;
