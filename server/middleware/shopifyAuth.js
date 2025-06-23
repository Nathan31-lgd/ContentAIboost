import { getShopifyAPI } from '../config/shopify.js';
import { logger } from '../utils/logger.js';
import tokenStore from '../services/tokenStore.js';

export const shopifyAuth = async (req, res, next) => {
  try {
    // 1. Vérifier les paramètres Shopify depuis query params (App Bridge)
    const shop = req.query.shop || req.headers['x-shopify-shop-domain'];
    
    if (!shop) {
      return res.status(400).json({
        error: 'Paramètre shop manquant',
        needsAuth: true,
        message: 'Le paramètre shop est requis pour l\'authentification'
      });
    }

    // 2. Nettoyer le nom de la boutique
    const cleanShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const shopDomain = cleanShop.includes('.') ? cleanShop : `${cleanShop}.myshopify.com`;

    // 3. Vérifier si on a un token d'accès stocké en BDD (PERMANENT)
    const storedToken = await tokenStore.getToken(shopDomain);
    if (storedToken) {
      req.shopifySession = {
        shop: shopDomain,
        accessToken: storedToken
      };
      
      logger.info(`✅ Token BDD trouvé pour ${shopDomain}`);
      return next();
    }

    // 4. Vérifier le token de session Shopify (App Bridge)
    const sessionToken = req.headers['x-shopify-session-token'] || 
                        req.headers['x-shopify-access-token'] ||
                        req.headers.authorization?.replace('Bearer ', '');

    if (sessionToken) {
      try {
        // Obtenir l'instance Shopify API
        const shopifyAPI = getShopifyAPI();
        
        // Décoder et vérifier le token de session Shopify
        const session = await shopifyAPI.utils.decodeSessionToken(sessionToken);
        if (session && session.shop === shopDomain) {
          // Utiliser le token de session comme fallback
          req.shopifySession = {
            shop: shopDomain,
            accessToken: sessionToken,
            sessionToken: sessionToken
          };
          
          logger.info(`✅ Session Shopify valide pour ${shopDomain}`);
          return next();
        }
      } catch (tokenError) {
        logger.warn('Token de session invalide:', tokenError);
      }
    }

    // 5. Aucune authentification valide trouvée
    logger.warn(`❌ Authentification manquante pour ${shopDomain}`);
    const allShops = await tokenStore.listShops();
    return res.status(401).json({
      error: 'Authentication requise',
      needsAuth: true,
      shop: shopDomain,
      message: 'Veuillez installer ou reconnecter l\'application',
      redirectUrl: `/api/auth/install?shop=${shopDomain}`,
      allShops: allShops
    });

  } catch (error) {
    logger.error('Erreur dans shopifyAuth middleware:', error);
    return res.status(500).json({
      error: 'Erreur d\'authentification',
      message: error.message
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