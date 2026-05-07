const inflight = new Map();

/**
 * Runs an async factory once per concurrent wave: overlapping calls with the same key
 * share one promise (e.g. React 18 Strict Mode mount → unmount → remount).
 * After the promise settles, the key is removed so a later call can fetch again.
 *
 * @param {string} key
 * @param {() => Promise<T>} factory
 * @returns {Promise<T>}
 */
export function runDeduped(key, factory) {
  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = Promise.resolve()
    .then(() => factory())
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise;
}
