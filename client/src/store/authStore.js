import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      // État
      token: null,
      user: null,
      isAuthenticated: false,

      // Actions
      setToken: (token) => set({ 
        token, 
        isAuthenticated: !!token 
      }),

      setUser: (user) => set({ 
        user 
      }),

      clearToken: () => set({ 
        token: null, 
        user: null,
        isAuthenticated: false 
      }),

      login: (token, user) => set({
        token,
        user,
        isAuthenticated: true,
      }),

      logout: () => set({
        token: null,
        user: null,
        isAuthenticated: false,
      }),

      // Initialiser le token depuis localStorage au démarrage
      initializeAuth: () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          set({ token, isAuthenticated: true });
        }
      },

      // Getters
      getToken: () => get().token,
      getUser: () => get().user,
      getIsAuthenticated: () => get().isAuthenticated,
    }),
    {
      name: 'contentaiboost-auth',
    }
  )
); 