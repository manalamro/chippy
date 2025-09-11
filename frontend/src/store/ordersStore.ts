import { create } from "zustand";
import { 
  createOrder, 
  fetchUserOrders, 
  adminFetchOrders,
  adminUpdateOrderStatus 
} from "../lib/apiClient";

interface Order {
  id: number;
  total: number;
  status: string;
  payment_status?: string;
  created_at: string;
  address: any;
  user_name: string;
  user_email: string;
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
  fetchAdminOrders: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
  addOrder: (addressId: number, payment: PaymentData) => Promise<void>;
  updateOrderStatus: (orderId: number, status: string) => Promise<void>;
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

  fetchAdminOrders: async (params?: { page?: number; limit?: number; status?: string }) => {
    set({ loading: true, error: undefined });
    try {
      const response = await adminFetchOrders(params);
      // Extract orders from the response based on your backend structure
      const orders = response.orders || response;
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

  updateOrderStatus: async (orderId, status) => {
    set({ loading: true, error: undefined });
    try {
      await adminUpdateOrderStatus(orderId, status);
      // Update the order in the local state
      set((state) => ({
        orders: state.orders.map(order => 
          order.id === orderId ? { ...order, status } : order
        ),
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err; // Re-throw to handle in the component
    }
  }
}));