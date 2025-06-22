import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // État
      token: null,
      user: null,
      isAuthenticated: false,

      // Actions
      setToken: (token) => {
        set({ 
          token, 
          isAuthenticated: !!token 
        });
        localStorage.setItem('auth_token', token);
      },

      setUser: (user) => {
        set({ user });
      },

      clearToken: () => {
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false 
        });
        localStorage.removeItem('auth_token');
      },

      logout: () => {
        const { token } = get();
        if (token) {
          // Appeler l'API de déconnexion
          fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ shop: get().user?.shop })
          }).catch(console.error);
        }
        
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false 
        });
      },

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
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
); 