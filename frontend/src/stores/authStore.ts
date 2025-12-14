import { create } from 'zustand';
import { api } from '../services/api';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

interface AuthStore {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            const { access_token } = response.data;

            localStorage.setItem('token', access_token);

            // Get user info
            const userResponse = await api.get<User>('/auth/me');
            const user = userResponse.data;

            localStorage.setItem('user', JSON.stringify(user));
            set({ token: access_token, user, isLoading: false });
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Login failed';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    register: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/auth/register', data);
            set({ isLoading: false });
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Registration failed';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ user: null, token: null });
            return;
        }

        try {
            const response = await api.get<User>('/auth/me');
            const user = response.data;
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, token });
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null });
        }
    },
}));
