// Combines every builder section's `useSectionAutosave` status into the one shown in the card
// header. Worst state wins: a failed save must never be hidden behind another section's "Saved".
const STATUS_PRIORITY = ['error', 'saving', 'pending', 'saved', 'idle'];

// `sections`: [{ id, label, status, errorMessage, canRetry, retry }] in display order.
// → { status, failed: [section…] } — `failed` lists every section whose last save failed.
export const aggregateSaveStatus = (sections = []) => {
  const present = sections.filter(section => section?.status);
  const status = STATUS_PRIORITY.find(candidate => present.some(section => section.status === candidate)) || 'idle';
  return { status, failed: present.filter(section => section.status === 'error') };
};
