const storageKey = slug => `circleJoinGuest:${slug}`;

export const getCircleJoinGuest = slug => {
  if (!slug || typeof window === 'undefined') return { full_name: '', email: '' };

  try {
    const parsed = JSON.parse(sessionStorage.getItem(storageKey(slug)) || '{}');
    return {
      full_name: parsed.full_name || '',
      email: parsed.email || '',
      first_name: parsed.first_name || '',
      last_name: parsed.last_name || '',
    };
  } catch {
    return { full_name: '', email: '' };
  }
};

export const setCircleJoinGuest = (slug, values = {}) => {
  if (!slug || typeof window === 'undefined') return;

  const fullName = (values.full_name || '').trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  sessionStorage.setItem(
    storageKey(slug),
    JSON.stringify({
      full_name: fullName,
      email: (values.email || '').trim().toLowerCase(),
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' ') || '',
    })
  );
};

export const clearCircleJoinGuest = slug => {
  if (!slug || typeof window === 'undefined') return;
  sessionStorage.removeItem(storageKey(slug));
};
