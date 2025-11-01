import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  mobile: string;
  apiKey: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface WhatsAppAccount {
  id: number;
  userId: number;
  accountToken: string;
  phoneNumber?: string;
  whatsappName?: string;
  isConnected: boolean;
  createdAt: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface WhatsAppAccountResponse {
  account: WhatsAppAccount;
  accountToken: string;
}

// Auth APIs
export const authAPI = {
  register: async (mobile: string, password: string) => {
    const response = await api.post<any>('/api/auth/register', {
      mobile,
      password,
    });
    return response.data;
  },

  login: async (mobile: string, password: string) => {
    const response = await api.post<any>('/api/auth/login', {
      mobile,
      password,
    });
    return response.data;
  },

  getProfile: async (apiKey: string) => {
    console.log('Making profile API call to:', API_BASE_URL + '/api/auth/profile');
    console.log('Using API key:', apiKey);

    const response = await api.get<any>('/api/auth/profile', {
      headers: {
        'X-API-Key': apiKey
      }
    });
    console.log('Profile API response:', response.data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },
};

// WhatsApp APIs
export const whatsappAPI = {
  createAccount: async (userId: number) => {
    const response = await api.post<WhatsAppAccountResponse>('/api/whatsapp/create-account', {
      userId,
    });
    return response.data;
  },

  getQRCode: async (accountToken: string) => {
    const response = await api.get(`/api/whatsapp/qr/${accountToken}`);
    return response.data;
  },

  checkConnectionStatus: async (accountToken: string) => {
    const response = await api.get(`/api/whatsapp/status/${accountToken}`);
    return response.data;
  },

  getUserAccounts: async (userId: number) => {
    const response = await api.get<WhatsAppAccount[]>(`/api/whatsapp/accounts/${userId}`);
    return response.data;
  },

  getConnectedAccounts: async (userId: number) => {
    const response = await api.get<WhatsAppAccount[]>(`/api/whatsapp/connected/${userId}`);
    return response.data;
  },
};

export default api;