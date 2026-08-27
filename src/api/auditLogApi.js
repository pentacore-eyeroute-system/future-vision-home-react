import axios from 'axios';
import { buildApiUrl } from '../config/apiUrlConfig';

const API = axios.create({
  baseURL: buildApiUrl('/audit-logs'),
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auditLogApi = {
  getAllLogs: async (params = {}) => {
    const response = await API.get('/', { params });
    return response.data?.result || response.data?.logs || response.data || [];
  },

  getLogById: async (id) => {
    const response = await API.get(`/${id}`);
    return response.data?.result || response.data;
  },

  exportCsv: async () => {
    const response = await API.get('/export/csv', { responseType: 'blob' });
    return response.data;
  },
};
