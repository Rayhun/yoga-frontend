'use client';

export const fillSubtitleTemplate = (template, channelLabel, contactValue) => {
  if (!template) return '';
  let index = 0;
  const values = [channelLabel, contactValue];
  return template.replace(/\{\}/g, () => values[index++] ?? '');
};

export const getVisibleRegistrationTabs = registrationTabs => {
  const options = registrationTabs?.options || [];
  return options.filter(option => option.is_visible !== false);
};

export const getDefaultRegistrationTab = registrationTabs => {
  const visibleTabs = getVisibleRegistrationTabs(registrationTabs);
  const selected = visibleTabs.find(tab => tab.id === registrationTabs?.selected_tab_id);
  return selected?.id || visibleTabs[0]?.id || 'email';
};

export const getResendDurationSeconds = timer => {
  const value = Number(timer);
  if (!value || Number.isNaN(value)) return 120;
  return value <= 10 ? value * 60 : value;
};

export const getVerificationChannelLabel = tabId => (tabId === 'phone' ? 'SMS' : 'email');
