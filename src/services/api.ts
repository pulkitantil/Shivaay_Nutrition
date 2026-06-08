export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Helper to get auth headers
const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('shivaay_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Generic Fetch Wrapper
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...getHeaders(), ...options.headers };
  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.msg || `API Error: ${response.status}`);
  }
  return response.json();
}

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  id?: string;
  _id?: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  status: 'In Stock' | 'Limited Stock' | 'Out of Stock';
  image: string;
  description: string;
  stock?: number;
  createdAt?: string;
}

export interface OrderProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  flavor: string;
}

export interface Order {
  id?: string;
  _id?: string;
  userId?: string | null;
  customerDetails: {
    name: string;
    phone: string;
  };
  products: OrderProduct[];
  amount: number;
  deliveryAddress: string;
  paymentMethod: string;
  status?: string;
  createdAt?: string;
}

// EXPOSED API CLIENT METHODS
export const api = {
  // Authentication
  auth: {
    register: async (userData: Omit<User, 'id' | 'role'> & { password?: string }): Promise<AuthResponse> => {
      return apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
    login: async (credentials: Pick<User, 'email'> & { password?: string }): Promise<AuthResponse> => {
      return apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    googleLogin: async (googlePayload: { name: string; email: string; googleId: string; imageUrl?: string }): Promise<AuthResponse> => {
      return apiFetch<AuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(googlePayload),
      });
    },
    getProfile: async (): Promise<User> => {
      return apiFetch<User>('/auth/me');
    },
  },

  // Administrative OTP Auth Flow
  adminAuth: {
    checkEmail: async (email: string): Promise<{ isFirstTime: boolean; msg: string }> => {
      return apiFetch<{ isFirstTime: boolean; msg: string }>('/admin/check-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    sendOtp: async (email: string): Promise<{ msg: string }> => {
      return apiFetch<{ msg: string }>('/admin/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    verifyOtp: async (email: string, otp: string): Promise<{ msg: string; isFirstTime: boolean }> => {
      return apiFetch<{ msg: string; isFirstTime: boolean }>('/admin/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
    },
    setPassword: async (payload: { email: string; otp: string; password?: string }): Promise<AuthResponse> => {
      return apiFetch<AuthResponse>('/admin/set-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    login: async (credentials: { email: string; password?: string }): Promise<AuthResponse> => {
      return apiFetch<AuthResponse>('/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
  },

  // Products Catalog
  products: {
    getAll: async (): Promise<Product[]> => {
      return apiFetch<Product[]>('/products');
    },
    getOne: async (id: string): Promise<Product> => {
      return apiFetch<Product>(`/products/${id}`);
    },
    create: async (productData: Product): Promise<Product> => {
      return apiFetch<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    },
    update: async (id: string, productData: Partial<Product>): Promise<Product> => {
      return apiFetch<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    },
    delete: async (id: string): Promise<{ id: string }> => {
      return apiFetch<{ id: string }>(`/products/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Orders Management
  orders: {
    getAll: async (): Promise<Order[]> => {
      return apiFetch<Order[]>('/orders');
    },
    getMyOrders: async (): Promise<Order[]> => {
      return apiFetch<Order[]>('/orders/my-orders');
    },
    create: async (orderData: Order): Promise<Order> => {
      return apiFetch<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },
    updateStatus: async (id: string, status: string): Promise<Order> => {
      return apiFetch<Order>(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
  },

  // Public Showroom Statistics
  stats: {
    getPublic: async (): Promise<{
      totalCustomers: number;
      totalProducts: number;
      totalBrands: number;
      totalOrders: number;
    }> => {
      return apiFetch<{
        totalCustomers: number;
        totalProducts: number;
        totalBrands: number;
        totalOrders: number;
      }>('/stats/public');
    },
  },

  // AI Assistant Chatbot
  ai: {
    chat: async (message: string): Promise<{ reply: string }> => {
      return apiFetch<{ reply: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },
  },
};
