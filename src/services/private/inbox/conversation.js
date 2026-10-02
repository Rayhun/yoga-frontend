import axios from '@/lib/axios';

export const getMyConversations = async () => {
  return axios.get('/chat/conversations');
};

export const getMyConversationMessages = async ({ id }) => {
  return axios.get(`/chat/conversations/${id}/messages`);
};

export const getAvailableCoaches = async (params = {}) => {
  return axios.get('/chat/coaches', { params });
};

export const createCoachConversation = async coachUserId => {
  return axios.post('/chat/coaches/conversation/', { coach_user_id: coachUserId });
};

/**
 * Upload chat media via fast backend → S3 path.
 *
 * Direct browser→S3 (presign) is disabled: the nurishdoc bucket has no CORS
 * rules for PUT, so the browser blocks it (Network shows "CORS error").
 * Re-enable only after adding S3 CORS (see comment below).
 *
 * S3 CORS example to allow direct upload later:
 * [
 *   {
 *     "AllowedHeaders": ["*"],
 *     "AllowedMethods": ["GET", "PUT", "HEAD"],
 *     "AllowedOrigins": ["https://your-frontend-domain.com"],
 *     "ExposeHeaders": ["ETag"]
 *   }
 * ]
 */
export const getPreSignedUrl = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post('/LMS/file/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
};
