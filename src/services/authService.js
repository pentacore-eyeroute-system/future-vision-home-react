import axios from 'axios';
import API from '../api/apiClient.js';

export const loginAdmin = (credentials) => API.post('/auth/login', credentials);