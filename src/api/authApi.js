import axios from 'axios';
import { buildApiUrl } from "../config/apiUrlConfig";

const API = axios.create({
  baseURL: buildApiUrl(''),
  withCredentials: true,
});

export const authApi = {
    loginAdmin: async (credentials) => {
        try {
            const response = await API.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
   
};