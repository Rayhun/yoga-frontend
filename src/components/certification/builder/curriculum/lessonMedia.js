// Audio / image lesson uploads: what the file must be (checked here, BEFORE any request, so the creator gets a
// clear message instead of a server 400) and how an upload becomes the lesson's `content_url`.
// The server enforces the same rules again (common/upload_validation.py); keep these in step with it.
import { extractApiErrorMessage } from '@/utils/helpers';

const ONE_MB = 1024 * 1024;

export const MEDIA_RULES = {
  audio: { kind: 'audio', label: 'Audio', noun: 'audio', extensions: ['mp3', 'm4a', 'wav', 'ogg', 'webm'], maxBytes: 50 * ONE_MB, mimePrefix: 'audio/' },
  image: { kind: 'image', label: 'Image', noun: 'image', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'], maxBytes: 5 * ONE_MB, mimePrefix: 'image/' },
};

// The upload response field that holds the private storage key (the other, `file_link`, is a short-lived URL).
export const UPLOAD_KEY_FIELD = 'file_key';

export const acceptAttribute = lessonType => (MEDIA_RULES[lessonType]?.extensions || []).map(extension => `.${extension}`).join(',');

export const describeAllowed = lessonType => {
  const rules = MEDIA_RULES[lessonType];
  return `${rules.extensions.join(', ')} · up to ${rules.maxBytes / ONE_MB} MB`;
};

const extensionOf = name => (typeof name === 'string' && name.includes('.') ? name.split('.').pop().toLowerCase() : '');

// A message when the file can't be uploaded for this lesson type, else null.
export const validateMediaFile = (lessonType, file) => {
  const rules = MEDIA_RULES[lessonType];
  if (!rules) return 'This lesson type does not take a file.';
  if (!file || typeof file.name !== 'string') return 'Choose a file to upload.';
  const extension = extensionOf(file.name);
  if (!rules.extensions.includes(extension)) {
    return `Choose an ${rules.noun} file (${rules.extensions.join(', ')}).`;
  }
  // Browsers describe the file by its extension. A .webm reported as video (the usual case) is refused by the
  // server for audio, so say so now rather than after the upload.
  if (file.type && !file.type.toLowerCase().startsWith(rules.mimePrefix)) {
    return extension === 'webm'
      ? 'This WebM file is identified as video. Save the audio as MP3 or M4A and try again.'
      : `This doesn’t look like an ${rules.noun} file. Choose one of: ${rules.extensions.join(', ')}.`;
  }
  if (!file.size) return 'The file is empty.';
  if (file.size > rules.maxBytes) {
    return `${rules.label} files can be at most ${rules.maxBytes / ONE_MB} MB (this file is ${(file.size / ONE_MB).toFixed(1)} MB).`;
  }
  return null;
};

export const IDLE = { status: 'idle', progress: 0, error: null };

/**
 * Validates, uploads (with `kind`) and, on success, hands the returned key to `onChange` as the lesson's
 * `content_url` (the lesson pane's normal change path, which schedules the autosave). `onState` receives the
 * control's status ({ status: 'idle' | 'uploading' | 'error', progress, error }). Nothing is sent when the file
 * is invalid. Resolves to true when the key was stored.
 */
export const pickLessonMedia = async ({ lessonType, file, uploadFn, onChange, onState }) => {
  const problem = validateMediaFile(lessonType, file);
  if (problem) {
    onState({ status: 'error', progress: 0, error: problem });
    return false;
  }
  onState({ status: 'uploading', progress: 0, error: null });
  try {
    const response = await uploadFn({
      file,
      kind: MEDIA_RULES[lessonType].kind,
      onUploadProgress: event => {
        const percent = event?.total ? Math.min(100, Math.round((event.loaded * 100) / event.total)) : 0;
        onState({ status: 'uploading', progress: percent, error: null });
      },
    });
    const key = response?.data?.[UPLOAD_KEY_FIELD];
    if (!key) throw new Error('The upload did not return a file key. Please try again.');
    onChange({ content_url: key, signed_content_url: '' });
    onState({ ...IDLE, progress: 100 });
    return true;
  } catch (error) {
    onState({ status: 'error', progress: 0, error: extractApiErrorMessage(error) });
    return false;
  }
};
