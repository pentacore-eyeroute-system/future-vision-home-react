import axios from 'axios';
import { VITE_API_BASE_URL } from '../config/apiUrlConfig';

const API = axios.create({
  baseURL: `${VITE_API_BASE_URL}/gallery`,
  withCredentials: true,
});

// Interceptor to attach the Admin JWT token securely
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllGalleries = () => API.get('/get-all-galleries');
export const createGallery = (formData) => API.post('/create-gallery', formData);
export const updateGallery = (id, formData) => API.patch(`/update-gallery-info/${id}`, formData);
export const temporaryDeleteGallery = (id) => API.patch(`/temporary-delete-gallery/${id}`, { isTemporarilyDeleted: true });
export const permanentDeleteGallery = (id) => API.put(`/soft-delete-gallery/${id}`);

// Backward compatibility wrapper for public-facing pages (e.g. OurWork.jsx)
export const galleryApi = {
  createGallery: async (formData) => {
    const response = await createGallery(formData);
    return response.data;
  },
  getGalleries: async () => {
    const response = await getAllGalleries();
    return response.data;
  },
  updateGallery: async (id, formData) => {
    const response = await updateGallery(id, formData);
    return response.data;
  },
  temporaryDeleteGallery: async (id, data) => {
    const isTemporarilyDeleted = data?.isTemporarilyDeleted !== undefined ? data.isTemporarilyDeleted : true;
    const response = await API.patch(`/temporary-delete-gallery/${id}`, { isTemporarilyDeleted });
    return response.data;
  },
  permanentDeleteGallery: async (id) => {
    const response = await permanentDeleteGallery(id);
    return response.data;
  }
};