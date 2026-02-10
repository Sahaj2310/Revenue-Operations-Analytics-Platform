import axios from 'axios';
import { StatsResponse, ForecastResponse, AdvancedAnalyticsResponse } from './types';

const API_Base = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_Base,
});

// Request Interceptor to add Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor to handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const fetchStats = async (): Promise<StatsResponse> => {
    const response = await api.get<StatsResponse>('/stats');
    return response.data;
};

export const getForecast = async (): Promise<ForecastResponse> => {
    const response = await api.get<ForecastResponse>('/forecast');
    return response.data;
};

export const fetchAdvancedAnalytics = async (range: string = '30d'): Promise<AdvancedAnalyticsResponse> => {
    const response = await api.get<AdvancedAnalyticsResponse>(`/analytics/advanced?time_range=${range}`);
    return response.data;
};

export const uploadFile = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const clearData = async (): Promise<any> => {
    const response = await api.delete('/data');
    return response.data;
};

export const fetchCustomers = async (): Promise<any[]> => {
    const response = await api.get('/customers');
    return response.data;
};

export const fetchCustomerDetails = async (name: string): Promise<any[]> => {
    const response = await api.get(`/customers/${name}`);
    return response.data;
};

// Alerts
export const fetchAlertRules = async (): Promise<any[]> => {
    const response = await api.get('/alerts/rules');
    return response.data;
};

export const createAlertRule = async (rule: any): Promise<any> => {
    const response = await api.post('/alerts/rules', rule);
    return response.data;
};

export const deleteAlertRule = async (id: number): Promise<any> => {
    const response = await api.delete(`/alerts/rules/${id}`);
    return response.data;
};

export const fetchAlertEvents = async (): Promise<any[]> => {
    const response = await api.get('/alerts/events');
    return response.data;
};

// Cohorts
export const fetchCohortAnalysis = async (): Promise<any> => {
    const response = await api.get('/analytics/cohorts');
    return response.data;
};

export default api;
