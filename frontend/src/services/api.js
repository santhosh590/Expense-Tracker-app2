import axios from "axios";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_URL = process.env.REACT_APP_API_URL || (isLocal ? "http://localhost:5000/api" : "https://expense-tracker-app2-1.onrender.com/api");

const api = axios.create({
  baseURL: API_URL,
});

// Automatically attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
