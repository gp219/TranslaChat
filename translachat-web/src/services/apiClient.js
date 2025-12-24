// src/services/apiClient.js

import axios from 'axios';
import { getAuthToken, clearAuthStorage } from './storageServices';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Authorization header before every request
apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 Unauthorized globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid. Logout the user.
            clearAuthStorage();
            // Redirect to login page
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default apiClient;