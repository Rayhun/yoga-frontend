// Video / audio / image lesson content. Right now creators give a LINK for all three (content hosted elsewhere);
// the upload path below is kept, switched off by MEDIA_UPLOAD_ENABLED, for when it comes back.
//
// Upload part: what the file must be (checked here, BEFORE any request, so the creator gets a clear message
// instead of a server 400) and how an upload becomes the lesson's `content_url`. The server enforces the same
// rules again (common/upload_validation.py); keep these in step with it.
import { extractApiErrorMessage } from '@/utils/helpers';

// The one switch. false = that lesson type shows only a URL input (no upload control). The backend accepts both
// a link and an uploaded file's key regardless of this flag, and lessons that already have an uploaded file keep
// working (see isStoredFileKey).
export const MEDIA_UPLOAD_ENABLED = { video: false, audio: false, image: false };
export const isMediaUploadEnabled = lessonType => Boolean(MEDIA_UPLOAD_ENABLED[lessonType]);

// Helper text under the link input, per lesson type.
export const LESSON_URL_HELP = {
  video: 'Paste a public https link: YouTube, Vimeo or a direct video file (.mp4).',
  audio: 'Paste a direct https link to an audio file (.mp3, .m4a, .wav).',
  image: 'Paste a direct https link to an image file (.jpg, .png, .webp).',
};
export const lessonUrlHelp = lessonType => LESSON_URL_HELP[lessonType] || '';

// Hosts whose usual share links open a web page, not the file: an audio / image element can't play or show them.
const PAGE_LINK_HOSTS = ['drive.google.com', 'docs.google.com'];
const DROPBOX_HOSTS = ['dropbox.com', 'www.dropbox.com'];
const DROPBOX_DIRECT_PARAMS = ['raw', 'dl'];

/**
 * A NON-BLOCKING warning (never an error: saving is still allowed) when an audio / image link looks like a web
 * page rather than the file: Google Drive / Docs links, and Dropbox links without a direct form (`raw=1` or
 * `dl=1`). null for video, for anything else, and for a link that isn't a valid https link (that has its own error).
 */
export const pageLinkWarning = (lessonType, value) => {
  if (!['audio', 'image'].includes(lessonType) || validateLessonUrl(value) || !String(value || '').trim()) return null;
  let parsed;
  try {
    parsed = new URL(String(value).trim());
  } catch (error) {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  const isDropboxPage =
    DROPBOX_HOSTS.includes(host) && !DROPBOX_DIRECT_PARAMS.some(name => parsed.searchParams.get(name) === '1');
  if (!PAGE_LINK_HOSTS.includes(host) && !isDropboxPage) return null;
  return `This looks like a page link. Use a direct file link so learners can ${lessonType === 'audio' ? 'play' : 'see'} it.`;
};

// Every key the upload endpoint returns starts with this (Certification/lesson_media.py UPLOAD_KEY_PREFIX).
export const STORAGE_KEY_PREFIX = 'certification/application/';
// content_url column length (Certification/lesson_media.py MAX_KEY_LENGTH).
export const MAX_LESSON_URL_LENGTH = 200;

// A value that is one of OUR stored files (uploaded earlier), not a link.
export const isStoredFileKey = value => typeof value === 'string' && value.trim().startsWith(STORAGE_KEY_PREFIX) && !value.includes('://');

// 'empty' | 'file' (uploaded earlier) | 'link'
export const lessonContentKind = value => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return 'empty';
  return isStoredFileKey(text) ? 'file' : 'link';
};

/**
 * A message when `value` can't be a video / audio / image lesson's link, else null (blank is fine here: a
 * lesson without content is a publish-readiness matter, not a typing error). Same rules as the backend
 * (Certification/lesson_media.py external_url_problem): an absolute https:// URL with a host, no credentials,
 * no spaces or control characters, at most 200 characters. The link is only checked as text, never fetched.
 */
export const validateLessonUrl = value => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return null;
  if (text.length > MAX_LESSON_URL_LENGTH) return `The link is too long (at most ${MAX_LESSON_URL_LENGTH} characters).`;
  // eslint-disable-next-line no-control-regex -- control characters are exactly what is being refused
  if (/[\s\u0000-\u001f\u007f\\]/.test(text)) return 'The link must not contain spaces or backslashes.';
  // a host must follow "https://" (the browser's URL parser would quietly accept "https:///x"; the server does not)
  if (!/^https:\/\/(?![/?#])/i.test(text)) return 'Use a full https:// link (http, relative and other kinds of link are not accepted).';
  let parsed;
  try {
    parsed = new URL(text);
  } catch (error) {
    return 'Enter a valid https link.';
  }
  if (parsed.protocol !== 'https:' || !parsed.hostname) return 'Enter a valid https link.';
  if (parsed.username || parsed.password || parsed.host.includes('@')) return 'The link must not contain a username or password.';
  return null;
};

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
