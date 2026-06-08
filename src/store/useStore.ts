import { create } from 'zustand';
import { api } from '@/services/api';
import { getProducts as getLocalProducts, getCategories as getLocalCategories } from '@/services/productService';

interface CartItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  flavor: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
}

interface StoreState {
  // Auth State
  token: string | null;
  user: UserProfile | null;
  authLoading: boolean;
  authError: string | null;
  login: (credentials: any) => Promise<any>;
  register: (userData: any) => Promise<any>;
  googleLogin: (payload: any) => Promise<any>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setSession: (token: string, user: any) => void;

  // Products State
  products: any[];
  productsLoading: boolean;
  categories: string[];
  fetchProducts: () => Promise<void>;

  // Offers State removed

  // Orders State
  orders: any[];
  ordersLoading: boolean;
  fetchOrders: () => Promise<void>;
  fetchMyOrders: () => Promise<void>;
  createOrder: (orderData: any) => Promise<any>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;

  // Cart State
  cart: CartItem[];
  addToCart: (product: any, flavor: string, quantity: number) => void;
  removeFromCart: (productId: string, flavor: string) => void;
  updateCartQty: (productId: string, flavor: string, qty: number) => void;
  clearCart: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Auth Initial State
  token: typeof window !== 'undefined' ? localStorage.getItem('shivaay_token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('shivaay_user') || 'null') : null,
  authLoading: false,
  authError: null,

  login: async (credentials) => {
    set({ authLoading: true, authError: null });
    try {
      const data = await api.auth.login(credentials);
      localStorage.setItem('shivaay_token', data.token);
      localStorage.setItem('shivaay_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, authLoading: false });
      return data.user;
    } catch (err: any) {
      set({ authLoading: false, authError: err.message || 'Login failed' });
      throw err;
    }
  },

  register: async (userData) => {
    set({ authLoading: true, authError: null });
    try {
      const data = await api.auth.register(userData);
      localStorage.setItem('shivaay_token', data.token);
      localStorage.setItem('shivaay_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, authLoading: false });
      return data.user;
    } catch (err: any) {
      set({ authLoading: false, authError: err.message || 'Registration failed' });
      throw err;
    }
  },

  googleLogin: async (payload) => {
    set({ authLoading: true, authError: null });
    try {
      const data = await api.auth.googleLogin(payload);
      localStorage.setItem('shivaay_token', data.token);
      localStorage.setItem('shivaay_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, authLoading: false });
      return data.user;
    } catch (err: any) {
      set({ authLoading: false, authError: err.message || 'Google Auth failed' });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('shivaay_token');
    localStorage.removeItem('shivaay_user');
    set({ token: null, user: null, orders: [] });
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return;
    set({ authLoading: true });
    try {
      const userProfile = await api.auth.getProfile();
      localStorage.setItem('shivaay_user', JSON.stringify(userProfile));
      set({ user: userProfile, authLoading: false });
    } catch (err) {
      console.warn('Load user profile failed, token might be expired. Logging out.');
      get().logout();
      set({ authLoading: false });
    }
  },

  setSession: (token, user) => {
    localStorage.setItem('shivaay_token', token);
    localStorage.setItem('shivaay_user', JSON.stringify(user));
    set({ token, user, authLoading: false });
  },

  // Products Initial State
  products: [],
  productsLoading: false,
  categories: [],

  fetchProducts: async () => {
    set({ productsLoading: true });
    try {
      const data = await api.products.getAll();
      const uniqueCats = Array.from(new Set(data.map(p => p.category)));
      set({ products: data, categories: uniqueCats, productsLoading: false });
    } catch (err) {
      console.warn('Backend products API failed, falling back to local seed data:', err);
      const localData = getLocalProducts();
      const localCats = getLocalCategories();
      set({ products: localData, categories: localCats, productsLoading: false });
    }
  },

  // Offers state removed

  // Orders Initial State
  orders: [],
  ordersLoading: false,

  fetchOrders: async () => {
    set({ ordersLoading: true });
    try {
      const data = await api.orders.getAll();
      set({ orders: data, ordersLoading: false });
    } catch (err) {
      console.warn('Backend orders fetch failed.');
      set({ ordersLoading: false });
    }
  },

  fetchMyOrders: async () => {
    set({ ordersLoading: true });
    try {
      const data = await api.orders.getMyOrders();
      set({ orders: data, ordersLoading: false });
    } catch (err) {
      console.warn('Backend user orders fetch failed. Loading local order mock logs.');
      const localMockOrders = [
        {
          id: 'ord-mock101',
          customerDetails: { name: get().user?.name || 'Customer', phone: get().user?.phone || '9999988888' },
          products: [
            { productId: '1', name: 'Shivaay Whey Gold Isolate', price: 7499, quantity: 1, flavor: 'Double Rich Chocolate' }
          ],
          amount: 7499,
          status: 'Confirmed',
          deliveryAddress: 'Omaxe City, Sonipat, India',
          paymentMethod: 'UPI / COD',
          createdAt: new Date().toISOString()
        }
      ];
      set({ orders: get().user ? localMockOrders : [], ordersLoading: false });
    }
  },

  createOrder: async (orderData) => {
    try {
      const data = await api.orders.create(orderData);
      // Refresh local products to reflect inventory update
      get().fetchProducts();
      return data;
    } catch (err) {
      console.warn('Backend orders creation failed. Mocking order processing.');
      // Fallback: simulate local order log
      const newOrder = {
        id: 'ord-' + Math.random().toString(36).substring(2, 9),
        ...orderData,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      // Just return it, frontend can launch WhatsApp directly
      return newOrder;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      await api.orders.updateStatus(id, status);
      get().fetchOrders();
    } catch (err) {
      console.warn('Backend order status update failed.');
    }
  },

  // Cart Initial State
  cart: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('shivaay_cart') || '[]') : [],

  addToCart: (product, flavor, quantity) => {
    const cart = get().cart;
    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.flavor === flavor
    );

    const updatedCart = [...cart];
    if (existingIndex !== -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        quantity,
        flavor,
      });
    }

    localStorage.setItem('shivaay_cart', JSON.stringify(updatedCart));
    set({ cart: updatedCart });
  },

  removeFromCart: (productId, flavor) => {
    const updatedCart = get().cart.filter(
      (item) => !(item.productId === productId && item.flavor === flavor)
    );
    localStorage.setItem('shivaay_cart', JSON.stringify(updatedCart));
    set({ cart: updatedCart });
  },

  updateCartQty: (productId, flavor, qty) => {
    const updatedCart = get().cart.map((item) => {
      if (item.productId === productId && item.flavor === flavor) {
        return { ...item, quantity: Math.max(1, qty) };
      }
      return item;
    });
    localStorage.setItem('shivaay_cart', JSON.stringify(updatedCart));
    set({ cart: updatedCart });
  },

  clearCart: () => {
    localStorage.removeItem('shivaay_cart');
    set({ cart: [] });
  },
}));
