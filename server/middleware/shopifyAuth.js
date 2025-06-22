import { getShopifyAPI } from '../config/shopify.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../../shared/constants/index.js';

export const shopifyAuth = async (req, res, next) => {
  try {
    // Récupérer les informations de session depuis les headers
    const shop = req.headers['x-shopify-shop-domain'];
    const accessToken = req.headers['x-shopify-access-token'];
    
    if (!shop || !accessToken) {
      return res.status(401).json({ 
        error: ERROR_MESSAGES.UNAUTHORIZED,
        message: 'Informations Shopify manquantes' 
      });
    }

    // Valider le format de la boutique
    if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)) {
      return res.status(400).json({ 
        error: 'Format de boutique invalide',
        message: 'Le domaine de la boutique doit être au format .myshopify.com' 
      });
    }

    // Ajouter les informations Shopify à la requête
    req.shopify = {
      shop,
      accessToken,
      apiVersion: '2024-01' // Version actuelle de l'API Shopify
    };

    next();
  } catch (error) {
    logger.error('Erreur d\'authentification Shopify:', error);
    return res.status(500).json({ 
      error: ERROR_MESSAGES.UNKNOWN_ERROR,
      message: 'Erreur lors de l\'authentification Shopify' 
    });
  }
};

// Middleware pour vérifier les permissions Shopify
export const checkShopifyPermissions = (requiredScopes = []) => {
  return async (req, res, next) => {
    try {
      const { shopify } = req;
      
      if (!shopify) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.UNAUTHORIZED,
          message: 'Session Shopify non trouvée' 
        });
      }

      // Vérifier les scopes requis
      if (requiredScopes.length > 0) {
        const shopifyAPI = getShopifyAPI();
        const session = {
          shop: shopify.shop,
          accessToken: shopify.accessToken,
          scope: process.env.SHOPIFY_SCOPES
        };

        // Vérifier que tous les scopes requis sont présents
        const userScopes = session.scope?.split(',') || [];
        const missingScopes = requiredScopes.filter(scope => !userScopes.includes(scope));
        
        if (missingScopes.length > 0) {
          return res.status(403).json({ 
            error: 'Permissions insuffisantes',
            message: `Scopes manquants: ${missingScopes.join(', ')}`,
            requiredScopes: missingScopes
          });
        }
      }

      next();
    } catch (error) {
      logger.error('Erreur lors de la vérification des permissions:', error);
      return res.status(500).json({ 
        error: ERROR_MESSAGES.UNKNOWN_ERROR 
      });
    }
  };
}; 