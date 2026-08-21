import axios from '@/lib/axios';

export const getNotificationsList = async ({ page = 1, page_size = 20 } = {}) => {
  return axios.get('/notifications/', { params: { page, page_size } });
};

export const createNotification = async ({ payload }) => {
  return axios.post('/notifications/', payload);
};

export const sendNotification = async ({ id, useTargetUsers = false }) => {
  const params = useTargetUsers ? { users: '' } : {};
  return axios.post(`/notifications/${id}/send/`, {}, { params });
};

export const bulkSendNotifications = async ({ notification_ids: notificationIds, useTargetUsers = false }) => {
  const params = useTargetUsers ? { users: '' } : {};
  return axios.post('/notifications/bulk-send/', { notification_ids: notificationIds }, { params });
};

export const getNotificationStats = async () => {
  return axios.get('/stats/');
};

export const getNotificationLogs = async ({ page = 1, page_size = 20 } = {}) => {
  return axios.get('/logs/', { params: { page, page_size } });
};

export const getDeviceTokensBrowse = async ({
  page = 1,
  page_size = 20,
  device_type,
  user_id,
  include_anonymous,
  active_only,
  search,
} = {}) => {
  const params = { page, page_size };
  if (device_type) params.device_type = device_type;
  if (user_id) params.user_id = user_id;
  if (include_anonymous !== undefined) params.include_anonymous = include_anonymous;
  if (active_only !== undefined) params.active_only = active_only;
  if (search) params.search = search;
  return axios.get('/device-tokens/dropdown/', { params });
};

export const testFirebaseConnection = async () => {
  return axios.get('/firebase/test/');
};
