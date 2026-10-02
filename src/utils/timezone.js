/**
 * Browser IANA timezone for X-User-Timezone header (same pattern as event APIs).
 */
export function getBrowserIANATimezone() {
  if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
    return 'UTC';
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}
