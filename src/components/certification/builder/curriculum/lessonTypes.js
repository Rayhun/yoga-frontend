// The six lesson types a creator can pick, and which of a lesson's fields each one uses.
export const LESSON_TYPE_OPTIONS = [
  { value: 'video', label: '🎥 Video' },
  { value: 'pdf', label: '📄 PDF' },
  { value: 'text', label: '📝 Text' },
  { value: 'quiz', label: '🧩 Quiz' },
  { value: 'assignment', label: '📤 Assignment' },
  { value: 'link', label: '🔗 Link' },
];

export const URL_LABELS = { video: 'Video URL', pdf: 'PDF URL', link: 'Link URL' };
export const TEXT_LABELS = { text: 'Text Content', assignment: 'Assignment Instructions' };

export const LESSON_TAB_IDS = { content: 'content', settings: 'settings', questions: 'questions' };
