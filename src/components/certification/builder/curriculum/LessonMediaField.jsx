'use client';
import { useEffect, useRef, useState } from 'react';
import { uploadCertificationFile } from '@/services/private/certification/application';
import { IDLE, MEDIA_RULES, acceptAttribute, describeAllowed, pickLessonMedia } from './lessonMedia';

const TOUCH_TARGET = 'min-h-[44px]';
const BUTTON = `${TOUCH_TARGET} rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark`;

// The file's name inside its storage key, for a lesson whose file is saved but has no preview link yet.
const fileNameOf = key => (typeof key === 'string' ? key.split('/').pop() : '');

/**
 * Upload control for an audio / image lesson's file. There is deliberately no text input: the file comes
 * only from our own upload (the key it returns is stored as `content_url`), never from a typed or pasted URL.
 * `onChange(patch)` is the lesson pane's normal change handler, so an upload / removal is autosaved like any edit.
 * Preview: the server's signed link for a saved file, or the local file right after choosing one.
 */
const LessonMediaField = ({ lessonType, title, value, previewUrl, disabled = false, onChange, uploadFn = uploadCertificationFile }) => {
  const rules = MEDIA_RULES[lessonType];
  const inputRef = useRef(null);
  const [state, setState] = useState(IDLE);
  const [localPreview, setLocalPreview] = useState('');
  const inputId = `lesson-${lessonType}-file`;
  const isUploading = state.status === 'uploading';
  const shownPreview = localPreview || previewUrl;

  useEffect(() => () => localPreview && URL.revokeObjectURL(localPreview), [localPreview]);

  const handleFile = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const stored = await pickLessonMedia({ lessonType, file, uploadFn, onChange, onState: setState });
    if (stored) setLocalPreview(URL.createObjectURL(file));
  };

  const handleRemove = () => {
    setLocalPreview('');
    setState(IDLE);
    onChange({ content_url: '', signed_content_url: '' });
  };

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={inputId} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {rules.label} file
      </label>

      {value && shownPreview ? (
        lessonType === 'audio' ? (
          <audio controls preload="metadata" src={shownPreview} aria-label={`Preview of ${title || 'the lesson'} audio`} className="w-full" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- a signed, expiring storage URL, not a Next-optimised asset
          <img src={shownPreview} alt={title ? `${title} (preview)` : 'Lesson image preview'} className="max-h-64 max-w-full rounded-lg border border-gray-200 object-contain dark:border-strokedark" />
        )
      ) : value ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">File uploaded: {fileNameOf(value)}</p>
      ) : (
        <p className="text-sm text-gray-500">No file yet. Allowed: {describeAllowed(lessonType)}.</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={BUTTON} disabled={disabled || isUploading} onClick={() => inputRef.current?.click()}>
          {isUploading ? `Uploading… ${state.progress}%` : value ? 'Replace' : `Upload ${rules.noun}`}
        </button>
        {value && !isUploading ? (
          <button type="button" className={`${BUTTON} hover:border-red-400 hover:text-red-600`} disabled={disabled} onClick={handleRemove}>
            Remove
          </button>
        ) : null}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={acceptAttribute(lessonType)}
          className="sr-only"
          tabIndex={-1}
          aria-label={`Choose an ${rules.noun} file to upload`}
          onChange={handleFile}
        />
      </div>

      {isUploading ? (
        <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={state.progress} aria-label="Upload progress" className="h-1.5 w-full rounded-full bg-gray-100">
          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${state.progress}%` }} />
        </div>
      ) : null}
      {state.error ? <p role="alert" className="text-sm text-red-600">{state.error}</p> : null}
    </div>
  );
};

export default LessonMediaField;
