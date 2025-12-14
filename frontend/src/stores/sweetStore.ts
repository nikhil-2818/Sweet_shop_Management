import { create } from 'zustand';
import { api } from '../services/api';
import type { Sweet } from '../types';

interface SweetStore {
    sweets: Sweet[];
    isLoading: boolean;
    error: string | null;
    fetchSweets: () => Promise<void>;
    createSweet: (sweet: Omit<Sweet, 'id'>) => Promise<void>;
    updateSweet: (id: number, sweet: Partial<Omit<Sweet, 'id'>>) => Promise<void>;
    deleteSweet: (id: number) => Promise<void>;
    purchaseSweet: (id: number, quantity: number) => Promise<void>;
    restockSweet: (id: number, quantity: number) => Promise<void>;
    searchSweets: (params: {
        name?: string;
        category?: string;
        min_price?: number;
        max_price?: number;
    }) => Promise<void>;
}

export const useSweetStore = create<SweetStore>((set) => ({
    sweets: [],
    isLoading: false,
    error: null,

    fetchSweets: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/sweets');
            set({ sweets: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.detail || 'Failed to fetch sweets', isLoading: false });
        }
    },

    createSweet: async (sweet) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/sweets', sweet);
            // Refresh the list
            const response = await api.get('/sweets');
            set({ sweets: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.detail || 'Failed to create sweet', isLoading: false });
            throw error;
        }
    },

    updateSweet: async (id, sweet) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/sweets/${id}`, sweet);
            // Refresh the list
            const response = await api.get('/sweets');
            set({ sweets: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.detail || 'Failed to update sweet', isLoading: false });
            throw error;
        }
    },

    deleteSweet: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/sweets/${id}`);
            // Refresh the list
            const response = await api.get('/sweets');
            set({ sweets: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.detail || 'Failed to delete sweet', isLoading: false });
            throw error;
        }
    },

    purchaseSweet: async (id, quantity) => {
        set({ isLoading: true, error: null });
        try {
            await api.post(`/sweets/${id}/purchase`, { quantity });
            // Refresh the list
            const response = await api.get('/sweets');
            set({ sweets: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.detail || 'Failed to purchase sweet', isLoading: false });
            throw error;
        }
    },

    restockSweet: async (id, quantity) => {
        set({ isLoading: true, error: null });
        try {
            await api.post(`/sweets/${id}/restock`, { quantity });
            // Refresh the list
            const response = await api.get('/sweets');
            set({ sweets: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.detail || 'Failed to restock sweet', isLoading: false });
            throw error;
        }
    },

    searchSweets: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/sweets/search', { params });
            set({ sweets: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.detail || 'Failed to search sweets', isLoading: false });
        }
    },
}));
