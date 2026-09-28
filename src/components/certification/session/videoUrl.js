// Turns the video links creators paste into a URL ReactPlayer (v2) plays reliably.
//
// Why: for any YouTube URL containing `list=` ReactPlayer builds the embed with videoId=null and a
// playlist instead, which the current YouTube IFrame API rejects ("Invalid video id") — leaving an
// empty iframe and never calling onError. Reducing every YouTube form to `watch?v=<id>` avoids it.
// Vimeo, direct files (.mp4 etc.) and anything unrecognised are passed through unchanged.

const YOUTUBE_ID = '([A-Za-z0-9_-]{11})';
const YOUTUBE_PATTERNS = [
  new RegExp(`youtu\\.be/${YOUTUBE_ID}`),
  new RegExp(`youtube(?:-nocookie)?\\.com/(?:shorts|embed|live|v)/${YOUTUBE_ID}`),
  new RegExp(`youtube\\.com/watch\\?(?:.*&)?v=${YOUTUBE_ID}`),
];

export const getYouTubeVideoId = url => {
  if (typeof url !== 'string') return null;
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const normalizeVideoUrl = url => {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  const youTubeId = getYouTubeVideoId(trimmed);
  return youTubeId ? `https://www.youtube.com/watch?v=${youTubeId}` : trimmed;
};
