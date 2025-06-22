import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import { logger } from '../utils/logger.js';

let shopify;

export const initializeShopify = () => {
  try {
    shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET,
      scopes: process.env.SHOPIFY_SCOPES?.split(',') || [
        'read_products',
        'write_products',
        'read_collections',
        'write_collections',
        'read_themes',
        'write_themes'
      ],
      hostName: process.env.SHOPIFY_APP_URL?.replace('https://', '').replace('http://', '') || 'localhost:3000',
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: true,
      // Configuration pour le développement
      ...(process.env.NODE_ENV === 'development' && {
        hostScheme: 'http',
        hostName: 'localhost:3000'
      })
    });

    logger.info('✅ Shopify API initialisée avec succès');
  } catch (error) {
    logger.error('❌ Erreur lors de l\'initialisation de Shopify:', error);
    throw error;
  }
};

export const getShopifyAPI = () => {
  if (!shopify) {
    throw new Error('Shopify API n\'est pas initialisée');
  }
  return shopify;
};

// Fonction utilitaire pour créer une session Shopify
export const createShopifySession = (shop, accessToken) => {
  return {
    id: `${shop}_${Date.now()}`,
    shop,
    state: 'state',
    isOnline: true,
    accessToken,
    scope: process.env.SHOPIFY_SCOPES,
    expires: null,
    onlineAccessInfo: null,
    isActive: () => true
  };
};

// Fonction pour obtenir un client Shopify Admin
export const getShopifyAdminClient = async (shop, accessToken) => {
  const session = createShopifySession(shop, accessToken);
  return shopify.clients.rest;
};

export default shopify; 