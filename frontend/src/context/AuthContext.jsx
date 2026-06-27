import React, { createContext, useState, useContext, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/apiUrl';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);
const AUTH_STORAGE_KEY = 'mentora_auth';
const LEGACY_TOKEN_KEY = 'token';
const LEGACY_USER_KEY = 'user';

const parseStoredAuth = (storage) => {
    try {
        const authPayload = storage.getItem(AUTH_STORAGE_KEY);
        if (authPayload) {
            const parsed = JSON.parse(authPayload);
            if (parsed?.token && parsed?.user) {
                return parsed;
            }
        }

        const token = storage.getItem(LEGACY_TOKEN_KEY);
        const user = storage.getItem(LEGACY_USER_KEY);
        if (token && user) {
            return {
                token,
                user: JSON.parse(user),
                rememberMe: storage === window.localStorage
            };
        }
    } catch {
        return null;
    }

    return null;
};

export const readStoredAuth = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return parseStoredAuth(window.sessionStorage) || parseStoredAuth(window.localStorage);
};

const clearStoredAuth = () => {
    if (typeof window === 'undefined') {
        return;
    }

    [window.localStorage, window.sessionStorage].forEach((storage) => {
        storage.removeItem(AUTH_STORAGE_KEY);
        storage.removeItem(LEGACY_TOKEN_KEY);
        storage.removeItem(LEGACY_USER_KEY);
    });
};

const persistAuth = ({ token, user, rememberMe = true }) => {
    if (typeof window === 'undefined') {
        return;
    }

    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    const payload = { token, user, rememberMe };

    clearStoredAuth();
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    storage.setItem(LEGACY_TOKEN_KEY, token);
    storage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedAuth = readStoredAuth();
        if (storedAuth?.token && storedAuth?.user) {
            setToken(storedAuth.token);
            setUser(storedAuth.user);
        }
        setLoading(false);
    }, []);

    const signup = async (name, email, password, rememberMe = true, persistSession = true) => {
        try {
            const res = await fetch(`${getApiBaseUrl()}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                if (persistSession) {
                    persistAuth({ token: data.token, user: data.user, rememberMe });
                    setToken(data.token);
                    setUser(data.user);
                }
                return { success: true };
            }
            const errorDetail = data.detail || data.message || 'Unknown error';
            const errorMsg = typeof errorDetail === 'string' ? errorDetail : Array.isArray(errorDetail) ? errorDetail.map(e => e.msg || JSON.stringify(e)).join(', ') : JSON.stringify(errorDetail);
            return { success: false, error: errorMsg };
        } catch (error) {
            return { success: false, error: 'সার্ভারে সংযোগ করতে পারেনি' };
        }
    };

    const login = async (email, password, rememberMe = true) => {
        try {
            const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                persistAuth({ token: data.token, user: data.user, rememberMe });
                setToken(data.token);
                setUser(data.user);
                return { success: true };
            }
            const errorDetail = data.detail || data.message || 'Unknown error';
            const errorMsg = typeof errorDetail === 'string' ? errorDetail : Array.isArray(errorDetail) ? errorDetail.map(e => e.msg || JSON.stringify(e)).join(', ') : JSON.stringify(errorDetail);
            return { success: false, error: errorMsg };
        } catch (error) {
            return { success: false, error: 'সার্ভারে সংযোগ করতে পারেনি' };
        }
    };

    const loginWithOTP = async (phone, otp, rememberMe = true) => {
        try {
            const res = await fetch(`${getApiBaseUrl()}/auth/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                persistAuth({ token: data.token, user: data.user, rememberMe });
                setToken(data.token);
                setUser(data.user);
                return { success: true };
            }
            const errorDetail = data.detail || data.message || 'Unknown error';
            const errorMsg = typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail);
            return { success: false, error: errorMsg };
        } catch (error) {
            return { success: false, error: 'সার্ভারে সংযোগ করতে পারেনি' };
        }
    };

    const loginWithGoogle = async (email, name, rememberMe = true) => {
        try {
            const res = await fetch(`${getApiBaseUrl()}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                persistAuth({ token: data.token, user: data.user, rememberMe });
                setToken(data.token);
                setUser(data.user);
                return { success: true };
            }
            const errorDetail = data.detail || data.message || 'Unknown error';
            const errorMsg = typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail);
            return { success: false, error: errorMsg };
        } catch (error) {
            return { success: false, error: 'সার্ভারে সংযোগ করতে পারেনি' };
        }
    };

    const logout = () => {
        clearStoredAuth();
        setToken(null);
        setUser(null);
    };

    const authFetch = async (input, init = {}) => {
        const storedAuth = readStoredAuth();
        const headers = new Headers(init.headers || {});

        if (storedAuth?.token) {
            headers.set('Authorization', `Bearer ${storedAuth.token}`);
        }

        return fetch(input, {
            ...init,
            headers
        });
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        const storedAuth = readStoredAuth();
        if (storedAuth) {
            persistAuth({
                token: storedAuth.token,
                user: updatedUser,
                rememberMe: storedAuth.rememberMe
            });
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, signup, login, logout, loginWithOTP, loginWithGoogle, authFetch, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
