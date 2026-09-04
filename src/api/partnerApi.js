import axios from 'axios';
import { buildApiUrl } from '../config/apiUrlConfig';

const API = axios.create({
  baseURL: buildApiUrl('/partners'),
  withCredentials: true,
});

// Interceptor to attach the Admin JWT token
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllPartners = () => API.get('/get-all-partners');
export const addPartner = (data) => API.post('/add-partner', data);
export const updatePartner = (id, data) => API.patch(`/update-partner-info/${id}`, data);
export const temporaryDeletePartner = (id) => API.patch(`/temporary-delete-partner/${id}`, { isTemporarilyDeleted: true });

// Backward compatibility for public routes (e.g. OurPartners.jsx)
export const partnerApi = {
  getPartners: async () => {
    const response = await getAllPartners();
    return response.data;
  }
};