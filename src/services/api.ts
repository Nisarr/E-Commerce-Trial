import axios from "axios";
import type { Banner } from "../types";

const api = axios.create({
  // In dev: Cloudflare Pages dev server proxies /api → Hono
  // In prod: same origin, no CORS issue
  baseURL: "/api",
  timeout: 8000,
});

export const getBanners = (position?: string) =>
  api.get(`/banners${position ? `?position=${position}` : ""}`);

export const createBanner = (banner: Omit<Banner, "id">) =>
  api.post("/banners", banner);

export const updateBanner = (id: string, banner: Partial<Banner>) =>
  api.put(`/banners/${id}`, banner);

export const deleteBanner = (id: string) =>
  api.delete(`/banners/${id}`);

export const getCategories = (featured = false) =>
  api.get(`/categories${featured ? "?featured=true" : ""}`);

export const getProducts = (params: Record<string, string | number>) =>
  api.get("/products", { params });

export const searchProducts = (q: string) =>
  api.get(`/products/search?q=${q}`);

export default api;
