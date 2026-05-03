import axios from "axios";
import type { Banner, Product, Category } from "../types";



const api = axios.create({
  // In dev: Cloudflare Pages dev server proxies /api → Hono
  // In prod: same origin, no CORS issue
  baseURL: "/api/v1",
  timeout: 8000,
});

// Add request interceptor for auth
api.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_ADMIN_API_KEY;
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

export const getBanners = async (position?: string): Promise<Banner[]> => {
  const res = await api.get(`/banners${position ? `?position=${position}` : ""}`);
  return res.data.items;
};

export const createBanner = async (banner: Omit<Banner, "id">) => {
  const res = await api.post("/banners", banner);
  return res.data;
};

export const updateBanner = async (id: string, banner: Partial<Banner>) => {
  const res = await api.patch(`/banners/${id}`, banner);
  return res.data;
};

export const deleteBanner = async (id: string) => {
  const res = await api.delete(`/banners/${id}`);
  return res.data;
};

export const getCategories = async (featured = false): Promise<Category[]> => {

  const res = await api.get(`/categories${featured ? "?featured=true" : ""}`);
  return res.data.items;
};

export const getProducts = async (params: Record<string, string | number>) => {
  const res = await api.get("/products", { params });
  return res.data; // { items, pagination, _links }
};

export const searchProducts = async (q: string): Promise<Product[]> => {
  const res = await api.get(`/products/search?q=${q}`);
  return res.data.items;
};

export const createProduct = async (product: Partial<Product>) => {
  const res = await api.post("/products", product);
  return res.data;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const res = await api.patch(`/products/${id}`, product);
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

export default api;


