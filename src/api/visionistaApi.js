import axios from 'axios';
import { buildApiUrl } from '../config/apiUrlConfig';

const API = axios.create({
  baseURL: buildApiUrl('/visionistas'),
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
//jebal

export const getAllVisionistas = () => API.get('/get-all-visionistas');

export const addVisionista = (formData) => API.post('/add-visionista', formData);

export const updateVisionista = (id, formData) => API.patch(`/update-visionista-info/${id}`, formData);

export const temporaryDeleteVisionista = (id) => API.patch(`/temporary-delete-visionista/${id}`, { isTemporarilyDeleted: true });

// Backward compatibility for public routes (e.g. OurWork.jsx)
export const visionistaApi = {
  getVisionistas: async () => {
    const response = await getAllVisionistas();
    return response.data;
  }
};