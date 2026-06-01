import axios from 'axios';
import { buildApiUrl } from "../config/apiUrlConfig";

const API = axios.create({
  baseURL: buildApiUrl(''),
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log("Interceptor Token:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Standard response interceptor to handle errors uniformly, matching the original fetch error structure
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;
    const message = payload?.message || `Request failed with status ${error.response?.status || error.message}.`;
    return Promise.reject(new Error(message));
  }
);

export const recentlyDeletedApi = {
  getDeletedVisionistas: async () => {
    const response = await API.get('/visionistas/temporary-deleted-visionistas');
    return response.data;
  },

  getDeletedNews: async () => {
    const response = await API.get('/news/temporary-deleted-news');
    return response.data;
  },

  getDeletedGalleries: async () => {
    const response = await API.get('/gallery/temporary-deleted-galleries');
    return response.data;
  },

  getDeletedPartners: async () => {
    const response = await API.get('/partners/temporary-deleted-partners');
    return response.data;
  },

  restoreDeletedVisionista: async (id, data) => {
    const response = await API.patch(`/visionistas/temporary-delete-visionista/${id}`, data);
    return response.data;
  },

  restoreDeletedNews: async (id, data) => {
    const response = await API.patch(`/news/temporary-delete-news/${id}`, data);
    return response.data;
  },

  restoreDeletedGallery: async (id, data) => {
    const response = await API.patch(`/gallery/temporary-delete-gallery/${id}`, data);
    return response.data;
  },

  restoreDeletedPartner: async (id, data) => {
    const response = await API.patch(`/partners/temporary-delete-partner/${id}`, data);
    return response.data;
  },

  permanentDeleteVisionista: async (id) => {
    const response = await API.put(`/visionistas/soft-delete-visionista/${id}`);
    return response.data;
  },

  permanentDeleteNews: async (id) => {
    const response = await API.put(`/news/soft-delete-news/${id}`);
    return response.data;
  },

  permanentDeleteGallery: async (id) => {
    const response = await API.put(`/gallery/soft-delete-gallery/${id}`);
    return response.data;
  },

  permanentDeletePartner: async (id) => {
    const response = await API.put(`/partners/soft-delete-partner/${id}`);
    return response.data;
  },
};