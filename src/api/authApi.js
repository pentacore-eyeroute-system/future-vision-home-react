import axios from 'axios';
import { buildApiUrl } from "../config/apiUrlConfig";

const API = axios.create({
  baseURL: buildApiUrl(''),
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

export const authApi = {
  loginAdmin: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  signup: async (userData) => {
    try {
      const payload = {
        fullname: userData.fullName || userData.fullname,
        fullName: userData.fullName || userData.fullname,
        email: userData.email,
        username: userData.username,
        password: userData.password,
      };
      const response = await API.post('/auth/onboard', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const response = await API.patch('/auth/password', settingsData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const response = await API.patch('/auth/password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  confirmPassword: async (password) => {
    try {
      const response = await API.post('/auth/confirm-password', { password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};