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
    // Don't auto-redirect on 401 - let pages handle it
    // Just log the error for debugging
    if (error.response?.status === 401) {
      console.warn('API: 401 Unauthorized -', error.config?.url);
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  name: string;
  mobile: string;
  apiKey: string;
  role: string;
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
  register: async (name: string, mobile: string, password: string) => {
    const response = await api.post<any>('/api/auth/register', {
      name,
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
    const apiKey = localStorage.getItem('apiKey') || localStorage.getItem('authToken');

    console.log('getCurrentUser: Checking for API key...');
    console.log('getCurrentUser: apiKey from localStorage:', apiKey ? 'Found' : 'Not found');

    if (!apiKey) {
      console.error('getCurrentUser: No API key found in localStorage');
      throw new Error('No API key found');
    }

    try {
      console.log('getCurrentUser: Making API call to /api/auth/profile');
      const response = await api.get<any>('/api/auth/profile', {
        headers: {
          'X-API-Key': apiKey
        }
      });
      console.log('getCurrentUser: Response received:', response.data);
      return response.data.user;
    } catch (error: any) {
      console.error('getCurrentUser: API call failed:', error);
      console.error('getCurrentUser: Error response:', error.response?.data);
      console.error('getCurrentUser: Error status:', error.response?.status);
      throw error;
    }
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
    const apiKey = localStorage.getItem('apiKey') || localStorage.getItem('authToken');
    const response = await api.get<{ success: boolean; accounts: WhatsAppAccount[] }>(`/api/whatsapp/accounts/${userId}`, {
      headers: {
        'X-API-Key': apiKey || ''
      }
    });
    return response.data.accounts;
  },

  getConnectedAccounts: async (userId: number) => {
    const apiKey = localStorage.getItem('apiKey') || localStorage.getItem('authToken');
    const response = await api.get<{ success: boolean; accounts: WhatsAppAccount[] }>(`/api/whatsapp/connected/${userId}`, {
      headers: {
        'X-API-Key': apiKey || ''
      }
    });
    return response.data.accounts;
  },
};

export default api;