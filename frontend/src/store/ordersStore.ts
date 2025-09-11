import { create } from "zustand";
import { createOrder, fetchUserOrders,adminFetchOrders } from "../lib/apiClient";

interface Order {
  id: number;
  total: number;
  status: string;
  payment_status?: string;
  created_at: string;
  address: any;
  user_name:string,
  user_email:string,
  items: any[];
}

interface PaymentData {
  cardNumber: string;
  cardName: string;
  expDate: string;
  cvv: string;
}

interface OrdersStore {
  orders: Order[];
  loading: boolean;
  error?: string;
  fetchOrders: () => Promise<void>;
  fetchAdminOrders: () => Promise<void>; // <-- add this

  addOrder: (addressId: number, payment: PaymentData) => Promise<void>;
}

export const useOrdersStore = create<OrdersStore>((set) => ({
  orders: [],
  loading: false,
  error: undefined,

  fetchOrders: async () => {
    set({ loading: true, error: undefined });
    try {
      const orders = await fetchUserOrders();
      set({ orders, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchAdminOrders: async () => {
    set({ loading: true, error: undefined });
    try {
      const orders = await adminFetchOrders(); // fetch all orders for admin
      set({ orders, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addOrder: async (addressId, payment) => {
    set({ loading: true, error: undefined });
    try {
      const newOrder = await createOrder(addressId, payment);
      set((state) => ({ orders: [newOrder, ...state.orders], loading: false }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
