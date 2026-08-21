/** Allowed circle chat attachments (docs + images). Voice notes use a separate recorder. */
export const CHAT_DOC_ACCEPT =
  '.ppt,.pptx,.pdf,.xls,.xlsx,.doc,.docx,.txt,.jpg,.jpeg,.png';

export const CHAT_DOC_EXTENSIONS = [
  'ppt',
  'pptx',
  'pdf',
  'xls',
  'xlsx',
  'doc',
  'docx',
  'txt',
  'jpg',
  'jpeg',
  'png',
];

export const MAX_CHAT_FILE_BYTES = 25 * 1024 * 1024; // 25MB
export const MAX_VOICE_NOTE_BYTES = 10 * 1024 * 1024; // 10MB
/** Max hold-to-record length (WhatsApp-style voice note cap). */
export const MAX_VOICE_NOTE_SECONDS = 90;

export const ATTACHMENT_TYPE = {
  VOICE: 'voice',
  AUDIO: 'audio',
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
  FILE: 'file',
};

export const getExtension = (nameOrUrl = '') => {
  const clean = String(nameOrUrl).split('?')[0].split('#')[0];
  const base = clean.split('/').pop() || '';
  const parts = base.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

export const isAllowedChatDoc = file => {
  const ext = getExtension(file?.name);
  return CHAT_DOC_EXTENSIONS.includes(ext);
};

export const isImageUrl = url => /\.(jpe?g|png|gif|bmp|webp)(\?.*)?$/i.test(url);

/** Clean media URL for storage / playback (strip chat metadata query params). */
export const getPlaybackUrl = url => {
  if (!url) return url;
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://local');
    parsed.searchParams.delete('kind');
    parsed.searchParams.delete('d');
    if (/^https?:/i.test(url)) return parsed.toString();
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return String(url)
      .replace(/([?&])kind=voice(&|$)/i, (_, sep, end) => (end === '&' ? sep : ''))
      .replace(/([?&])d=\d+(?:\.\d+)?(&|$)/i, (_, sep, end) => (end === '&' ? sep : ''))
      .replace(/\?$/, '');
  }
};

/** Build WS attachment payload stored on Attachment model. */
export const buildAttachmentPayload = ({
  fileUrl,
  fileType = ATTACHMENT_TYPE.FILE,
  durationSeconds = null,
}) => {
  const cleanUrl = getPlaybackUrl(fileUrl);
  const payload = {
    file: cleanUrl,
    file_type: fileType,
  };
  if (
    (fileType === ATTACHMENT_TYPE.VOICE || fileType === ATTACHMENT_TYPE.AUDIO) &&
    durationSeconds != null &&
    Number.isFinite(Number(durationSeconds))
  ) {
    payload.duration_seconds = Math.max(1, Math.round(Number(durationSeconds)));
  }
  return payload;
};

/** Infer UI type from attachment row (model fields preferred, URL fallback). */
export const resolveAttachmentKind = att => {
  const type = (att?.file_type || att?.type || '').toLowerCase();
  const url = att?.file || att?.url || '';
  if (type === ATTACHMENT_TYPE.VOICE || isVoiceNoteUrl(url)) return ATTACHMENT_TYPE.VOICE;
  if (type === ATTACHMENT_TYPE.AUDIO || isAudioUrl(url)) return ATTACHMENT_TYPE.AUDIO;
  if (type === ATTACHMENT_TYPE.IMAGE || isImageUrl(url)) return ATTACHMENT_TYPE.IMAGE;
  if (type === ATTACHMENT_TYPE.VIDEO || isVideoUrl(url)) return ATTACHMENT_TYPE.VIDEO;
  if (type === ATTACHMENT_TYPE.DOCUMENT) return ATTACHMENT_TYPE.DOCUMENT;
  const ext = getExtension(url);
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext)) {
    return ATTACHMENT_TYPE.DOCUMENT;
  }
  return ATTACHMENT_TYPE.FILE;
};

export const getAttachmentDuration = att => {
  const fromModel = Number(att?.duration_seconds ?? att?.duration);
  if (Number.isFinite(fromModel) && fromModel > 0) return fromModel;
  return getVoiceDurationFromUrl(att?.file || att?.url || '');
};

/** @deprecated Prefer buildAttachmentPayload — kept for older tagged URLs */
export const markVoiceNoteUrl = (url, durationSec = null) => {
  const payload = buildAttachmentPayload({
    fileUrl: url,
    fileType: ATTACHMENT_TYPE.VOICE,
    durationSeconds: durationSec,
  });
  // Legacy query tag only if somehow needed for old clients
  try {
    const parsed = new URL(payload.file, typeof window !== 'undefined' ? window.location.origin : 'https://local');
    parsed.searchParams.set('kind', 'voice');
    if (payload.duration_seconds) parsed.searchParams.set('d', String(payload.duration_seconds));
    return /^https?:/i.test(payload.file) ? parsed.toString() : payload.file;
  } catch {
    return payload.file;
  }
};

/** Duration (seconds) embedded in the attachment URL, if present. */
export const getVoiceDurationFromUrl = url => {
  if (!url) return 0;
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://local');
    const d = Number(parsed.searchParams.get('d'));
    return Number.isFinite(d) && d > 0 ? d : 0;
  } catch {
    const match = String(url).match(/[?&]d=(\d+(?:\.\d+)?)/i);
    const d = match ? Number(match[1]) : 0;
    return Number.isFinite(d) && d > 0 ? d : 0;
  }
};

export const isVoiceNoteUrl = url =>
  /(?:\?|&)kind=voice(?:&|$)/i.test(url) ||
  /voice-note[^/]*\.(webm|ogg|mp4|m4a|mp3|wav|aac|opus|weba)(\?.*)?$/i.test(url);

export const isAudioUrl = url =>
  isVoiceNoteUrl(url) ||
  /\.(mp3|wav|ogg|m4a|aac|opus|weba)(\?.*)?$/i.test(url) ||
  // Chrome records voice as .webm — treat voice-tagged / voice-named webm as audio, not video
  (/voice-note/i.test(url) && /\.webm(\?.*)?$/i.test(url));

export const isVideoUrl = url =>
  !isAudioUrl(url) && /\.(mp4|avi|mov|wmv|flv|webm)(\?.*)?$/i.test(url);

export const getFileIcon = nameOrUrl => {
  const extension = getExtension(nameOrUrl);
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'ppt':
    case 'pptx':
      return '📋';
    case 'txt':
      return '📃';
    case 'zip':
    case 'rar':
      return '📦';
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'm4a':
    case 'webm':
    case 'aac':
    case 'opus':
    case 'weba':
      return '🎵';
    case 'mp4':
    case 'avi':
    case 'mov':
      return '🎥';
    default:
      return '📎';
  }
};

export const formatDuration = totalSeconds => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const pickRecorderMimeType = () => {
  if (typeof MediaRecorder === 'undefined') return '';
  // Prefer webm on Chromium (complete playable blobs). Prefer mp4 on Safari.
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isSafari = /safari/i.test(ua) && !/chrome|chromium|android/i.test(ua);
  const candidates = isSafari
    ? ['audio/mp4', 'audio/aac', 'audio/webm']
    : ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return candidates.find(type => MediaRecorder.isTypeSupported(type)) || '';
};

export const extensionForMime = mimeType => {
  if (!mimeType) return 'webm';
  if (mimeType.includes('mp4') || mimeType.includes('aac')) return 'm4a';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm';
};

/** Best-effort MIME hint for <audio type="..."> from a voice URL. */
export const mimeTypeForVoiceUrl = url => {
  const ext = getExtension(getPlaybackUrl(url) || url);
  switch (ext) {
    case 'm4a':
    case 'mp4':
      return 'audio/mp4';
    case 'webm':
      return 'audio/webm';
    case 'ogg':
    case 'opus':
      return 'audio/ogg';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'aac':
      return 'audio/aac';
    default:
      return '';
  }
};
