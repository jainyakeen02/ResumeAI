import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
const baseURL = (rawApiUrl && rawApiUrl !== 'undefined')
  ? `${rawApiUrl}/api`
  : 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration & 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user session if unauthorized/expired
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page if not already there
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login?expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default api;