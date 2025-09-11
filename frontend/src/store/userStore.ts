import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login, signup } from '../lib/apiClient';
import { useCartStore } from './cartStore';
import type { User } from '../types/user';

interface UserState {
  user?: User;
  token?: string;
  loading: boolean;
  error?: string;

  loginUser: (email: string, password: string) => Promise<void>;
  signupUser: (name: string, email: string, password: string) => Promise<void>;
  logoutUser: () => void;
  setUser: (user: User, token: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: undefined,
      token: undefined,
      loading: false,
      error: undefined,

      loginUser: async (email, password) => {
        set({ loading: true, error: undefined });
        try {
          const data = await login(email, password);
          localStorage.setItem('token', data.token);
          
          get().setUser(data.user, data.token);

          const cartStore = useCartStore.getState();
          await cartStore.fetchCart(String(data.user.id));

        } catch (err: any) {
          set({ error: err.response?.data?.message || err.message, loading: false });
        }
      },

      signupUser: async (name, email, password) => {
        set({ loading: true, error: undefined });
        try {
          const data = await signup(name, email, password);
          localStorage.setItem('token', data.token);
          
          get().setUser(data.user, data.token);

          const cartStore = useCartStore.getState();
          await cartStore.fetchCart(String(data.user.id));

        } catch (err: any) {
          set({ error: err.response?.data?.message || err.message, loading: false });
        }
      },

      setUser: (user: User, token: string) => {
        set({ user, token, loading: false });
      },

      logoutUser: () => {
        localStorage.removeItem('token');
        set({ user: undefined, token: undefined });
        
        const cartStore = useCartStore.getState();
        cartStore.clearCart();
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);