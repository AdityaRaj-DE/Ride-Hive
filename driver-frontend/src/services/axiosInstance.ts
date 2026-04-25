import axios from "axios";
import { storage } from "../../shared/utils/storage";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await storage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
