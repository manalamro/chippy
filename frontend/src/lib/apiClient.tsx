import axios from "axios";
import { useUserStore } from "../store/userStore";

const apiClient = axios.create({
  baseURL: "http://localhost:5432", // adjust if backend is deployed elsewhere
  headers: { "Content-Type": "application/json" },
});

// attach token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add this to your existing apiClient.ts
export const validateToken = async () => {
  const res = await apiClient.get("/auth/validate");
  return res.data;
};

// handle 401 globally (logout user if token is invalid/expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      useUserStore.getState().logoutUser();
    }
    return Promise.reject(error);
  }
);

// ---------------------- ADDRESSES ----------------------
export const createAddress = async (data: any) => {
  const res = await apiClient.post("/addresses", data);
  return res.data.address;
};


// ---------------------- AUTH ----------------------
export const signup = async (name: string, email: string, password: string) => {
  const res = await apiClient.post("/auth/signup", { name, email, password });
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await apiClient.post("/auth/login", { email, password });
  return res.data;
};

// ---------------------- PRODUCTS ----------------------
export const getProducts = async (params?: { search?: string; category?: string }) => {
  const res = await apiClient.get("/products", { params });
  return res.data?.data?.products || [];
};

export const getProductBySlug = async (slug: string) => {
  const res = await apiClient.get(`/products/${slug}`);
  return res.data.data;
};

export const getCategories = async () => {
  const res = await apiClient.get("/products/categories");
  return res.data?.data || [];
};

// ---------------------- CART ----------------------
export const getCart = async () => {
  const res = await apiClient.get("/cart");
  return res.data;
};

export const addToCart = async (product_id: number, quantity: number) => {
  const res = await apiClient.post("/cart/items", { product_id, quantity });
  return res.data;
};

export const updateCartItem = async (itemId: number, quantity: number) => {
  const res = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
  return res.data;
};

export const removeCartItem = async (itemId: number) => {
  const res = await apiClient.delete(`/cart/items/${itemId}`);
  return res.data;
};

// ---------------------- ORDERS ----------------------
export const createOrder = async (addressId: number, payment: any) => {
  const res = await apiClient.post("/orders", { address_id: addressId, payment });
  return res.data;
};

export const fetchUserOrders = async () => {
  const res = await apiClient.get("/orders");
  return res.data;
};

// ---------------------- ADMIN ----------------------
export const adminGetProducts = async () => {
  const res = await apiClient.get("/admin/products");
  return res.data;
};

export const adminGetCategories = async () => {
  const res = await apiClient.get("/admin/categories");
  return res.data;
};

export const adminFetchOrders = async (params?: { page?: number; limit?: number; status?: string }) => {
  const res = await apiClient.get("/admin/orders", { params });
  return res.data.orders; // match response structure from backend
};

export const adminUpdateOrderStatus = async (orderId: number, status: string) => {
  const res = await apiClient.patch(`/admin/orders/${orderId}/status`, { status });
  return res.data;
};
export const adminCreateProduct = async (data: any) => {
  const res = await apiClient.post("/admin/products", data);
  return res.data;
};

export const adminUpdateProduct = async (id: number, data: any) => {
  const res = await apiClient.put(`/admin/products/${id}`, data);
  return res.data;
};

export const adminDeleteProduct = async (id: number) => {
  const res = await apiClient.delete(`/admin/products/${id}`);
  return res.data;
};

// Categories
export const adminCreateCategory = async (data: any) => {
  const res = await apiClient.post("/admin/categories", data);
  return res.data;
};

export const adminUpdateCategory = async (id: number, data: any) => {
  const res = await apiClient.put(`/admin/categories/${id}`, data);
  return res.data;
};

export const adminDeleteCategory = async (id: number) => {
  const res = await apiClient.delete(`/admin/categories/${id}`);
  return res.data;
};


export default apiClient;


