// Outline selection is tracked by `_key`, never by index: reorders and the 409 reset change indices,
// and a new item's `_key` survives its id being adopted after the save.

// → { type: 'module', mi } | { type: 'lesson', mi, li } | null
export const locateByKey = (modules, key) => {
  if (!key) return null;
  for (let mi = 0; mi < modules.length; mi += 1) {
    if (modules[mi]._key === key) return { type: 'module', mi };
    const li = (modules[mi].lessons || []).findIndex(lesson => lesson._key === key);
    if (li !== -1) return { type: 'lesson', mi, li };
  }
  return null;
};

// The key to show: the selected one if it still exists, else its module (a lesson removed by a 409
// reset), else the first module, else nothing.
export const resolveSelectedKey = (modules, selectedKey, fallbackModuleKey) => {
  if (locateByKey(modules, selectedKey)) return selectedKey;
  if (locateByKey(modules, fallbackModuleKey)?.type === 'module') return fallbackModuleKey;
  return modules[0]?._key ?? null;
};

// `_key` of the module that owns `key` (itself for a module).
export const moduleKeyOf = (modules, key) => {
  const location = locateByKey(modules, key);
  return location ? modules[location.mi]._key : null;
};
