import axios from 'axios';
import { VITE_API_BASE_URL } from '../config/apiUrlConfig';

const API = axios.create({
  baseURL: `${VITE_API_BASE_URL}/news`,
  withCredentials: true,
});

// Interceptor to attach the Admin JWT token securely
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllNews = () => API.get('/get-all-news');
export const createNews = (formData) => API.post('/create-news', formData);
export const updateNews = (id, formData) => API.patch(`/update-news-info/${id}`, formData);
export const temporaryDeleteNews = (id) => API.patch(`/temporary-delete-news/${id}`, { isTemporarilyDeleted: true });

// Backward compatibility for public routes (e.g. OurWork.jsx, Article.jsx)
export const newsApi = {
  getNews: async () => {
    const response = await getAllNews();
    return { result: response.data.result || [] };
  }
};