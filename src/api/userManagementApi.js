import axios from 'axios';
import { buildApiUrl } from '../config/apiUrlConfig';

const API = axios.create({
  baseURL: buildApiUrl('/user-management'),
  withCredentials: true,
});

// Automatically attach Admin Token from storage to requests
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userManagementApi = {
  getPendingRequests: async () => {
    const response = await API.get('/pending-request');
    return response.data?.result || [];
  },

  getStaffMembers: async () => {
    const response = await API.get('/staff-members');
    return response.data?.result || [];
  },

  updatePendingRequest: async (id, status) => {
    const response = await API.patch(`/pending-request/${id}`, { status });
    return response.data?.result;
  },

  updateStaffRole: async (id, role) => {
    const response = await API.patch(`/staff-members/${id}/role`, { role: role.toLowerCase() });
    return response.data?.result;
  },

  updateStaffStatus: async (id, status) => {
    const response = await API.patch(`/staff-members/${id}/status`, { status });
    return response.data?.result;
  },
};
