import axios from "axios";

// Tạo instance axios với config mặc định
const api = axios.create({
  baseURL: "http://localhost:5173",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor để xử lý token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add interceptor để xử lý response
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Xử lý refresh token hoặc logout nếu cần
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

export default api;
