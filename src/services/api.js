import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://server-y72m.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const saved = localStorage.getItem("adminAuth");
  const tokenOnly = localStorage.getItem("adminToken");

  let token = tokenOnly;

  if (!token && saved) {
    try {
      const parsed = JSON.parse(saved);
      token = parsed?.token || "";
    } catch {
      token = "";
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
