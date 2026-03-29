/**
 * 🔌 SILEXAR PULSE - API Client
 * Client for connecting frontend to backend API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v2';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: async (data: { email: string; name: string; password: string }) => {
        const response = await apiClient.post('/auth/register', data);
        if (response.data.access_token) {
            localStorage.setItem('auth_token', response.data.access_token);
        }
        return response.data;
    },

    login: async (data: { email: string; password: string }) => {
        const response = await apiClient.post('/auth/login', data);
        if (response.data.access_token) {
            localStorage.setItem('auth_token', response.data.access_token);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    },

    getProfile: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('auth_token');
    },
};

// Campaigns API
export const campaignsAPI = {
    list: async (params?: { page?: number; limit?: number; status?: string }) => {
        const response = await apiClient.get('/campanas', { params });
        return response.data;
    },

    get: async (id: string) => {
        const response = await apiClient.get(`/campanas/${id}`);
        return response.data;
    },

    create: async (data: Record<string, unknown>) => {
        const response = await apiClient.post('/campanas', data);
        return response.data;
    },

    update: async (id: string, data: Record<string, unknown>) => {
        const response = await apiClient.put(`/campanas/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/campanas/${id}`);
        return response.data;
    },

    activate: async (id: string) => {
        const response = await apiClient.post(`/campanas/${id}/activate`);
        return response.data;
    },

    pause: async (id: string) => {
        const response = await apiClient.post(`/campanas/${id}/pause`);
        return response.data;
    },

    getAnalytics: async (id: string, params?: { startDate?: string; endDate?: string }) => {
        const response = await apiClient.get(`/campanas/${id}/analytics`, { params });
        return response.data;
    },

    getForecast: async (id: string) => {
        const response = await apiClient.get(`/campanas/${id}/forecast`);
        return response.data;
    },
};

// Cortex API
export const cortexAPI = {
    getStatus: async () => {
        const response = await apiClient.get('/cortex/status');
        return response.data;
    },

    listEngines: async () => {
        const response = await apiClient.get('/cortex/engines');
        return response.data;
    },

    predict: async (data: Record<string, unknown>) => {
        const response = await apiClient.post('/cortex/predict', data);
        return response.data;
    },

    optimize: async (data: Record<string, unknown>) => {
        const response = await apiClient.post('/cortex/optimize', data);
        return response.data;
    },

    forecast: async (data: Record<string, unknown>) => {
        const response = await apiClient.post('/cortex/forecast', data);
        return response.data;
    },

    getAnalytics: async () => {
        const response = await apiClient.get('/cortex/analytics');
        return response.data;
    },
};

// Narratives API
export const narrativesAPI = {
    list: async (campaignId?: string) => {
        const url = campaignId ? `/narratives/campaign/${campaignId}` : '/narratives';
        const response = await apiClient.get(url);
        return response.data;
    },

    get: async (id: string) => {
        const response = await apiClient.get(`/narratives/${id}`);
        return response.data;
    },

    create: async (data: Record<string, unknown>) => {
        const response = await apiClient.post('/narratives', data);
        return response.data;
    },

    update: async (id: string, data: Record<string, unknown>) => {
        const response = await apiClient.put(`/narratives/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/narratives/${id}`);
        return response.data;
    },

    validate: async (id: string) => {
        const response = await apiClient.post(`/narratives/${id}/validate`);
        return response.data;
    },

    activate: async (id: string) => {
        const response = await apiClient.post(`/narratives/${id}/activate`);
        return response.data;
    },

    executeNode: async (id: string, nodeId: string, context: Record<string, unknown>) => {
        const response = await apiClient.post(`/narratives/${id}/execute/${nodeId}`, context);
        return response.data;
    },
};

// Health API
export const healthAPI = {
    check: async () => {
        const response = await apiClient.get('/health/ready');
        return response.data;
    },
};

// Export default client
export default apiClient;
