import axios from "axios";

const api = axios.create({
  baseURL: "https://expense-tracker-app2.onrender.com/api",
});

// Automatically attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
