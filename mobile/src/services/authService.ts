import apiService from './apiService';
import { setToken, removeToken } from '../utils/helpers';

export const authService = {
  login: async (credentials: any) => {
    const response = await apiService.post('/auth/login', credentials);
    if (response.data.token) {
      await setToken(response.data.token);
    }
    return response.data;
  },

  register: async (userData: any) => {
    const response = await apiService.post('/auth/register', userData);
    if (response.data.token) {
      await setToken(response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    await removeToken();
  },

  getProfile: async () => {
    const response = await apiService.get('/auth/me');
    return response.data;
  },
};
