import { logger } from './logger';

// Instance App Bridge (sera définie depuis le contexte)
let appBridge = null;

// Fonction pour définir l'instance App Bridge
export const setAppBridge = (bridge) => {
  appBridge = bridge;
  logger.info('App Bridge configuré dans api.js');
};

// Fonction pour obtenir un token de session depuis App Bridge
const getSessionToken = async () => {
  if (!appBridge) {
    logger.warn('App Bridge non disponible, pas de token de session');
    return null;
  }

  try {
    // Méthode 1: Utiliser getSessionToken si disponible
    if (typeof appBridge.getSessionToken === 'function') {
      logger.info('Tentative getSessionToken...');
      const token = await appBridge.getSessionToken();
      if (token) {
        logger.info('Token obtenu via getSessionToken');
        return token;
      }
    }

    // Méthode 2: Utiliser authenticatedFetch
    if (appBridge.authenticatedFetch) {
      logger.info('Utilisation de authenticatedFetch');
      return 'use-authenticated-fetch';
    }

    // Méthode 3: Essayer d'accéder aux actions App Bridge
    if (appBridge.actions) {
      logger.info('Tentative via actions App Bridge...');
      // Essayer d'obtenir un token via les actions
      if (appBridge.actions.AuthCode) {
        const authCode = appBridge.actions.AuthCode.create();
        const token = await authCode.dispatch();
        if (token) {
          logger.info('Token obtenu via AuthCode');
          return token;
        }
      }
    }

    // Méthode 4: Essayer d'utiliser la session directement
    if (appBridge.session) {
      logger.info('Utilisation de la session App Bridge');
      return appBridge.session.token || appBridge.session.accessToken;
    }

    logger.warn('Aucune méthode de token disponible dans App Bridge');
    return null;
  } catch (error) {
    logger.error('Erreur lors de la récupération du token de session:', error);
    return null;
  }
};

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Récupérer les paramètres Shopify de l'URL
const getShopifyParams = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const params = {};
  
  // Paramètres essentiels
  ['shop', 'host', 'hmac', 'timestamp', 'session', 'locale', 'embedded'].forEach(param => {
    const value = searchParams.get(param);
    if (value) params[param] = value;
  });

  logger.debug('Paramètres Shopify récupérés:', params);
  return params;
};

// Fonction helper pour faire les requêtes
const fetchAPI = async (endpoint, options = {}) => {
  try {
    // Récupérer les paramètres Shopify
    const shopifyParams = getShopifyParams();
    
    // Construire l'URL avec les paramètres
    const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
    Object.entries(shopifyParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    // Obtenir le token de session
    const sessionToken = await getSessionToken();
    
    // Préparer les headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Si nous avons un token de session et qu'il n'est pas 'use-authenticated-fetch'
    if (sessionToken && sessionToken !== 'use-authenticated-fetch') {
      headers['x-shopify-access-token'] = sessionToken;
      headers['x-shopify-session-token'] = sessionToken;
    }

    // Si nous devons utiliser authenticatedFetch
    let fetchFunction = fetch;
    if (sessionToken === 'use-authenticated-fetch' && appBridge?.authenticatedFetch) {
      fetchFunction = appBridge.authenticatedFetch;
      logger.debug('Utilisation de authenticatedFetch');
    }

    logger.debug('API Request:', {
      url: url.toString(),
      method: options.method || 'GET',
      params: shopifyParams,
      hasToken: !!sessionToken,
      tokenType: typeof sessionToken
    });

    const response = await fetchFunction(url.toString(), {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      logger.error('API Error:', {
        url: endpoint,
        status: response.status,
        message: errorData?.error || response.statusText,
        data: errorData
      });
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Log la source des données pour debug
    if (data.source) {
      logger.info(`Données provenant de: ${data.source}`);
    }
    
    return data;
  } catch (error) {
    logger.error('Erreur lors de la requête API:', error);
    throw error;
  }
};

// API Endpoints
export const api = {
  // Debug
  auth: {
    debug: (shop) => fetchAPI(`/auth/debug?shop=${shop}`),
    status: (shop) => fetchAPI(`/auth/status?shop=${shop}`),
  },

  // Produits
  products: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetchAPI(`/products${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => fetchAPI(`/products/${id}`),
    sync: () => fetchAPI('/products/sync', { method: 'POST' }),
  },

  // Collections
  collections: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetchAPI(`/collections${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => fetchAPI(`/collections/${id}`),
    sync: () => fetchAPI('/collections/sync', { method: 'POST' }),
  },

  // Optimisations
  optimizations: {
    generateSuggestions: (type, id) => 
      fetchAPI(`/ai/generate-suggestions`, {
        method: 'POST',
        body: JSON.stringify({ type, id }),
      }),
    applySuggestions: (type, id, suggestions) =>
      fetchAPI(`/ai/apply-suggestions`, {
        method: 'POST',
        body: JSON.stringify({ type, id, suggestions }),
      }),
    bulkOptimize: (optimizationData) =>
      fetchAPI(`/optimizations/bulk`, {
        method: 'POST',
        body: JSON.stringify(optimizationData),
      }),
  },

  // Utilisateurs
  users: {
    getProfile: () => fetchAPI('/users/profile'),
    updateProfile: (data) => 
      fetchAPI('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
};

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