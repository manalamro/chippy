import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '../lib/apiClient';

export interface Product {
  id: number;
  title: string;
  price: number ;
  images?: Array<{ url: string; alt: string; id?: number }>;
  category?: { name: string };
  slug?: string;
  stock?: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unit_price?: number | string;
  item_total?: number;
}

export interface Cart {
  id: string;
  userId?: string | null;
  items: CartItem[];
  total?: number;
}

export interface CartState {
  cart?: Cart;
  loading: boolean;
  error?: string;

  fetchCart: (userId?: string) => Promise<void>;
  addItemToCart: (productId: number, quantity: number, product: Product, cartId?: string) => Promise<void>;
  updateCartItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItemFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;
  syncGuestCartToBackend: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: undefined,
      loading: false,
      error: undefined,

      fetchCart: async (userId?: string) => {
        set({ loading: true, error: undefined });

        try {
          if (userId) {
            const backendCart = await api.getCart();
            const currentCart = get().cart;
            const hasGuestItems = currentCart && currentCart.userId === null && currentCart.items.length > 0;

            if (hasGuestItems) {
              await get().syncGuestCartToBackend();
              const updatedCart = await api.getCart();
              set({
                cart: {
                  id: `user-${userId}`,
                  userId,
                  items: mapBackendItemsToFrontend(updatedCart.items),
                  total: updatedCart.total
                },
                loading: false
              });
            } else {
              set({
                cart: {
                  id: `user-${userId}`,
                  userId,
                  items: mapBackendItemsToFrontend(backendCart.items),
                  total: backendCart.total
                },
                loading: false
              });
            }

            localStorage.removeItem('guest_cart_id');
          } else {
            const guestCartId = localStorage.getItem('guest_cart_id');
            if (guestCartId && get().cart?.id === guestCartId) {
              set({ loading: false });
            } else {
              const cartData: Cart = { id: `guest-${Date.now()}`, userId: null, items: [] };
              localStorage.setItem('guest_cart_id', cartData.id);
              set({ cart: cartData, loading: false });
            }
          }
        } catch (error: any) {
          console.error('Error fetching cart:', error);
          set({ error: error.response?.data?.message || 'Failed to fetch cart', loading: false });
        }
      },

      addItemToCart: async (productId: number, quantity: number, product: Product, cartId?: string) => {
        if (!product) throw new Error("Product data must be provided");

        set({ loading: true, error: undefined });

        try {
          const currentCart = get().cart;
          const token = localStorage.getItem('token');
          const isAuthenticated = currentCart?.userId || token;

          if (isAuthenticated && token) {
            await api.addToCart(productId, quantity);
            const updatedBackendCart = await api.getCart();
            set({
              cart: {
                id: currentCart?.id || `user-authenticated`,
                userId: currentCart?.userId || 'authenticated',
                items: mapBackendItemsToFrontend(updatedBackendCart.items),
                total: updatedBackendCart.total
              },
              loading: false
            });
          } else {
            // Guest cart
            const guestCart = currentCart || { id: cartId || `guest-${Date.now()}`, userId: null, items: [] };
            const existingIndex = guestCart.items.findIndex(item => item.product.id === productId);

            let updatedItems: CartItem[];
            if (existingIndex >= 0) {
              const currentItem = guestCart.items[existingIndex];
              const newQuantity = currentItem.quantity + quantity;

              if (currentItem.product.stock !== undefined && newQuantity > currentItem.product.stock) {
                throw new Error(`Only ${currentItem.product.stock} items available in stock.`);
              }

              updatedItems = guestCart.items.map((item, idx) =>
                idx === existingIndex ? { ...item, quantity: newQuantity } : item
              );
            } else {
              if (product.stock !== undefined && quantity > product.stock) {
                throw new Error(`Only ${product.stock} items available in stock.`);
              }

              const newItem: CartItem = {
                id: `cart-item-${productId}-${Date.now()}`,
                product: { ...product, stock: product.stock ?? 0 },
                quantity,
                unit_price: product.price
              };
              updatedItems = [...guestCart.items, newItem];
            }

            const updatedCart = { ...guestCart, items: updatedItems };

            if (!currentCart) {
              localStorage.setItem('guest_cart_id', updatedCart.id);
            }

            set({ cart: updatedCart, loading: false });
          }
        } catch (error: any) {
          console.error('Error adding item to cart:', error);
          set({ error: error.response?.data?.message || error.message || 'Failed to add item to cart', loading: false });
        }
      },

      updateCartItemQuantity: async (itemId: string, quantity: number) => {
        set({ loading: true, error: undefined });

        try {
          const currentCart = get().cart;
          if (!currentCart) { set({ loading: false }); return; }

          if (currentCart.userId) {
            const numericItemId = extractNumericId(itemId);
            if (quantity <= 0) {
              await api.removeCartItem(numericItemId);
            } else {
              await api.updateCartItem(numericItemId, quantity);
            }

            const updatedBackendCart = await api.getCart();
            set({
              cart: {
                id: currentCart.id,
                userId: currentCart.userId,
                items: mapBackendItemsToFrontend(updatedBackendCart.items),
                total: updatedBackendCart.total
              },
              loading: false
            });
          } else {
            const item = currentCart.items.find(item => item.id === itemId);

            if (item && quantity > 0 && item.product.stock !== undefined && quantity > item.product.stock) {
              throw new Error(`Only ${item.product.stock} items available in stock.`);
            }

            if (quantity <= 0) {
              const updatedItems = currentCart.items.filter(item => item.id !== itemId);
              set({ cart: { ...currentCart, items: updatedItems }, loading: false });
              return;
            }

            const updatedItems = currentCart.items.map(item =>
              item.id === itemId ? { ...item, quantity } : item
            );
            set({ cart: { ...currentCart, items: updatedItems }, loading: false });
          }
        } catch (error: any) {
          console.error('Error updating cart item:', error);
          set({ error: error.response?.data?.message || error.message || 'Failed to update cart item', loading: false });
        }
      },

      removeItemFromCart: async (itemId: string) => {
        set({ loading: true, error: undefined });
        try {
          const currentCart = get().cart;
          if (!currentCart) { set({ loading: false }); return; }

          if (currentCart.userId) {
            const numericItemId = extractNumericId(itemId);
            await api.removeCartItem(numericItemId);
            const updatedBackendCart = await api.getCart();
            set({
              cart: {
                id: currentCart.id,
                userId: currentCart.userId,
                items: mapBackendItemsToFrontend(updatedBackendCart.items),
                total: updatedBackendCart.total
              },
              loading: false
            });
          } else {
            const updatedItems = currentCart.items.filter(item => item.id !== itemId);
            set({ cart: { ...currentCart, items: updatedItems }, loading: false });
          }
        } catch (error: any) {
          console.error('Error removing cart item:', error);
          set({ error: error.response?.data?.message || 'Failed to remove cart item', loading: false });
        }
      },

      clearCart: () => {
        set({ cart: { id: `guest-${Date.now()}`, userId: null, items: [] } });
        localStorage.removeItem('guest_cart_id');
      },

      syncGuestCartToBackend: async () => {
        const currentCart = get().cart;
        if (!currentCart || currentCart.userId || currentCart.items.length === 0) return;

        try {
          for (const item of currentCart.items) {
            await api.addToCart(item.product.id, item.quantity);
          }
        } catch (error) {
          console.error('Error syncing guest cart:', error);
          throw error;
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

function mapBackendItemsToFrontend(backendItems: any[]): CartItem[] {
  return backendItems.map(item => ({
    id: `backend-${item.id}`,
    product: {
      id: item.product_id,
      title: item.title,
      price: item.unit_price,
      slug: item.slug,
      stock: item.stock,
      images: item.image_url ? [{ url: item.image_url, alt: item.title }] : []
    },
    quantity: item.quantity,
    unit_price: item.unit_price,
    item_total: item.item_total
  }));
}

function extractNumericId(itemId: string): number {
  if (itemId.startsWith('backend-')) {
    return parseInt(itemId.replace('backend-', ''));
  }
  const match = itemId.match(/cart-item-(\d+)-/);
  if (match) return parseInt(match[1]);
  return parseInt(itemId);
}
