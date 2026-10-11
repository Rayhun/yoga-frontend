import axios from '@/lib/axios';

// Admin-only endpoints (BACKEND2026 Certification/api/v1/admin_portal/application_csv/api.py and
// application_review/create_qte.py). `type` is 'qte' | 'institution'; `status` is the table's status filter.

export const exportApplications = async ({ type, status }) => {
  return axios.get('/certification/admin/applications/export/', {
    params: { type, ...(status ? { status } : {}) },
    responseType: 'blob',
  });
};

// dryRun=true validates and reports without writing. Update-only: the backend matches rows by email and
// never creates accounts or touches passwords.
export const importApplications = async ({ type, file, dryRun = false }) => {
  const formData = new FormData();
  formData.append('type', type);
  formData.append('file', file);
  if (dryRun) formData.append('dry_run', 'true');
  return axios.post('/certification/admin/applications/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// body: { email, first_name, last_name, legal_name?, public_name?, country?, timezone? }
export const createQteApplication = async payload => {
  return axios.post('/certification/admin/applications/qte/', payload);
};
