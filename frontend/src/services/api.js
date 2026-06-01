const API_URL = 'http://localhost:8000/api';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response) => {
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
