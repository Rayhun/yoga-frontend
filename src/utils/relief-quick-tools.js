export const GUIDED_CONTENT_TYPE_LABELS = {
  video: 'Video',
  audio: 'Audio',
  image: 'Guides / Lessons',
};

export const getGuidedContentTypeLabel = value =>
  GUIDED_CONTENT_TYPE_LABELS[value] || value || '—';
