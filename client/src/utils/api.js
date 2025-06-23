import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Créer une instance axios avec configuration de base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ajouter withCredentials pour gérer les cookies de session
  withCredentials: true,
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      useAuthStore.getState().clearToken();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Méthodes utilitaires
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

export default api;

// Classe API
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Méthode pour construire les headers
  getHeaders() {
    const token = useAuthStore.getState().token;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Ajouter les headers Shopify si disponibles
    const shop = useAuthStore.getState().user?.shop;
    if (shop) {
      headers['x-shopify-shop-domain'] = shop;
    }

    return headers;
  }

  // Méthode générique pour les requêtes
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Gérer les erreurs HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `Erreur HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      // Parser la réponse JSON
      const data = await response.json();
      return data;
    } catch (error) {
      // Gérer les erreurs réseau
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        'Erreur de réseau',
        0,
        { originalError: error.message }
      );
    }
  }

  // Méthodes HTTP
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Méthodes spécialisées pour les produits
  async getProducts(params = {}) {
    return this.get('/products', params);
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async optimizeProduct(id, data) {
    return this.post(`/products/${id}/optimize`, data);
  }

  async updateProduct(id, data) {
    return this.put(`/products/${id}`, data);
  }

  async analyzeProduct(id, data) {
    return this.post(`/products/${id}/analyze`, data);
  }

  // Méthodes spécialisées pour les collections
  async getCollections(params = {}) {
    return this.get('/collections', params);
  }

  async getCollection(id) {
    return this.get(`/collections/${id}`);
  }

  async optimizeCollection(id, data) {
    return this.post(`/collections/${id}/optimize`, data);
  }

  async updateCollection(id, data) {
    return this.put(`/collections/${id}`, data);
  }

  async analyzeCollection(id, data) {
    return this.post(`/collections/${id}/analyze`, data);
  }

  async getCollectionProducts(id, params = {}) {
    return this.get(`/collections/${id}/products`, params);
  }

  // Méthodes spécialisées pour les optimisations en masse
  async startBulkOptimization(data) {
    return this.post('/optimizations/bulk', data);
  }

  async getOptimizationTask(taskId) {
    return this.get(`/optimizations/task/${taskId}`);
  }

  async getOptimizationTasks(params = {}) {
    return this.get('/optimizations/tasks', params);
  }

  async cancelOptimizationTask(taskId) {
    return this.post(`/optimizations/task/${taskId}/cancel`);
  }

  async applyOptimizationResults(taskId, data) {
    return this.post(`/optimizations/task/${taskId}/apply`, data);
  }

  // Méthodes spécialisées pour les utilisateurs
  async getUserProfile() {
    return this.get('/users/profile');
  }

  async updateApiKeys(data) {
    return this.put('/users/api-keys', data);
  }

  async deleteApiKey(provider) {
    return this.delete(`/users/api-keys/${provider}`);
  }

  async updateSubscription(data) {
    return this.put('/users/subscription', data);
  }

  async getUserStats() {
    return this.get('/users/stats');
  }

  async resetUsage() {
    return this.post('/users/reset-usage');
  }

  async testApiKey(data) {
    return this.post('/users/test-api-key', data);
  }

  // Méthodes spécialisées pour l'IA
  async analyzeContent(data) {
    return this.post('/ai/analyze', data);
  }

  async generateKeywords(data) {
    return this.post('/ai/keywords', data);
  }

  async optimizeTitle(data) {
    return this.post('/ai/optimize-title', data);
  }

  async optimizeDescription(data) {
    return this.post('/ai/optimize-description', data);
  }

  async optimizeImageAlt(data) {
    return this.post('/ai/optimize-image-alt', data);
  }

  async analyzeKeywordDensity(data) {
    return this.post('/ai/keyword-density', data);
  }

  async getSuggestions(data) {
    return this.post('/ai/suggestions', data);
  }

  async getAiProvidersStatus() {
    return this.get('/ai/providers/status');
  }

  // Méthodes spécialisées pour l'authentification
  async verifyAuth() {
    return this.get('/auth/verify');
  }

  async logout() {
    return this.post('/auth/logout');
  }
}

// Classe d'erreur personnalisée
class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Instance singleton
const apiClientInstance = new ApiClient();

// Hook personnalisé pour les requêtes avec gestion d'erreurs
export const useApi = () => {
  const { showError, showSuccess } = useNotificationStore();

  const apiWithNotifications = {
    ...apiClientInstance,
    
    // Wrapper pour les requêtes avec notifications automatiques
    async requestWithNotification(endpoint, options = {}, successMessage = null) {
      try {
        const result = await apiClientInstance.request(endpoint, options);
        
        if (successMessage) {
          showSuccess(successMessage);
        }
        
        return result;
      } catch (error) {
        const message = error.message || 'Une erreur est survenue';
        showError(message);
        throw error;
      }
    },

    // Méthodes avec notifications automatiques
    async optimizeProductWithNotification(id, data) {
      return this.requestWithNotification(
        `/products/${id}/optimize`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        'Produit optimisé avec succès !'
      );
    },

    async optimizeCollectionWithNotification(id, data) {
      return this.requestWithNotification(
        `/collections/${id}/optimize`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        'Collection optimisée avec succès !'
      );
    },

    async startBulkOptimizationWithNotification(data) {
      return this.requestWithNotification(
        '/optimizations/bulk',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        'Optimisation en masse démarrée !'
      );
    },

    async updateApiKeysWithNotification(data) {
      return this.requestWithNotification(
        '/users/api-keys',
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
        'Clés API mises à jour avec succès !'
      );
    },
  };

  return apiWithNotifications;
};

export { ApiError }; 