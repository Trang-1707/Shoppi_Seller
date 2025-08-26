import axios from 'axios';
import { BACKEND_API_URI } from '../utils/constants';

axios.defaults.withCredentials = false;

const api = axios.create({
    baseURL: BACKEND_API_URI
});

// Add a request interceptor to include auth token with every request
api.interceptors.request.use(
    config => {
        // Try to get token from localStorage first (this is most common)
        let token = localStorage.getItem('token');

        // If not found, try to get from accessToken key (alternative storage key)
        if (!token) {
            token = localStorage.getItem('accessToken');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('No authentication token found for API request');
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    async error => {
        // Do not attempt token refresh (no refresh endpoint). Let caller handle 401/403.
        return Promise.reject(error);
    }
);

export { api };
