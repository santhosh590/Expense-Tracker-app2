import axios from 'axios';
import { API_URL } from '../utils/constants';
import { getToken, removeToken } from '../utils/helpers';

const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiService.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized, token expired or invalid
      await removeToken();
      // Handle redirect to login if necessary through a global event or context
    }
    return Promise.reject(error);
  }
);

export const uploadFile = async (uri: string, type: string, name: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type,
    name,
  } as any);

  return apiService.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default apiService;
