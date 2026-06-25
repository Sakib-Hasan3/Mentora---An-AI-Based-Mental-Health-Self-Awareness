import { readStoredAuth } from '../context/AuthContext';

const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return `http://${hostname}:8000/api`;
    }
    return 'http://localhost:8000/api';
};
const API_URL = getApiUrl();

const getToken = () => {
    const auth = readStoredAuth();
    const token = auth ? auth.token : null;
    console.log('Token from storage:', token ? token.substring(0, 50) + '...' : 'No token');
    return token;
};

const handleResponse = async (response) => {
    if (response.status === 401) {
        console.log('401 Unauthorized - clearing token');
        // Use the clear function from auth context to be safe
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(LEGACY_TOKEN_KEY);
        localStorage.removeItem(LEGACY_USER_KEY);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(LEGACY_TOKEN_KEY);
        sessionStorage.removeItem(LEGACY_USER_KEY);
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.detail || data.message || 'Request failed');
    }
    
    return data;
};

const request = async (endpoint, options = {}) => {
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`Request to ${endpoint} with auth header`);
    } else {
        console.log(`Request to ${endpoint} WITHOUT auth header`);
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });
    
    return handleResponse(response);
};

export const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, data) => request(endpoint, { 
        method: 'POST', 
        body: JSON.stringify(data) 
    }),
    put: (endpoint, data) => request(endpoint, { 
        method: 'PUT', 
        body: JSON.stringify(data) 
    }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

// For handleResponse, we need the keys. It's better to import them if they are exported,
// but for now, we'll redefine them to avoid breaking changes if they are not.
const AUTH_STORAGE_KEY = 'mentora_auth';
const LEGACY_TOKEN_KEY = 'token';
const LEGACY_USER_KEY = 'user';