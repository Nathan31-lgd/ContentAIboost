import express from 'express';
import { logger } from '../utils/logger.js';
import shopifySimpleService from '../services/shopifySimpleService.js';
import { shopifyAuth } from '../middleware/shopifyAuth.js';
import tokenStore from '../services/tokenStore.js';

const router = express.Router();

// Synchroniser les produits depuis Shopify (automatique)
router.post('/sync', shopifyAuth, async (req, res) => {
  try {
    const { shop, accessToken } = req.shopifySession;
    
    logger.info(`Synchronisation automatique demandée pour ${shop}`);
    
    // Vérifier d'abord si le token est valide
    try {
      const testResponse = await fetch(`https://${shop}/admin/api/2025-04/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });
      
      if (!testResponse.ok) {
        logger.error(`Token invalide pour ${shop}: ${testResponse.status}`);
        // Supprimer le token invalide
        await tokenStore.removeToken(shop);
        
        return res.status(401).json({
          error: 'Token d\'accès expiré',
          message: 'Veuillez réinstaller l\'application pour renouveler l\'accès',
          requiresReinstall: true,
          redirectUrl: `/api/auth/install?shop=${shop}`
        });
      }
    } catch (tokenError) {
      logger.error('Erreur lors de la vérification du token:', tokenError);
      return res.status(401).json({
        error: 'Token d\'accès invalide',
        message: 'Veuillez réinstaller l\'application',
        requiresReinstall: true,
        redirectUrl: `/api/auth/install?shop=${shop}`
      });
    }
    
    // Récupérer les produits depuis Shopify
    const products = await shopifySimpleService.getProductsFromShopify(shop, accessToken, { limit: 250 });
    
    if (products && products.length > 0) {
      res.json({
        success: true,
        message: `${products.length} produits synchronisés avec succès`,
        count: products.length
      });
    } else {
      res.json({
        success: true,
        message: 'Aucun produit trouvé dans votre boutique',
        count: 0
      });
    }
  } catch (error) {
    logger.error('Erreur lors de la synchronisation:', error);
    
    // Gestion spécifique des erreurs 401
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      const { shop } = req.shopifySession;
      await tokenStore.removeToken(shop);
      
      return res.status(401).json({
        error: 'Token d\'accès expiré',
        message: 'Veuillez réinstaller l\'application pour renouveler l\'accès',
        requiresReinstall: true,
        redirectUrl: `/api/auth/install?shop=${shop}`
      });
    }
    
    res.status(500).json({
      error: 'Erreur lors de la synchronisation',
      message: error.message
    });
  }
});

// Récupérer tous les produits
router.get('/', shopifyAuth, async (req, res) => {
  try {
    const { shop, accessToken } = req.shopifySession;
    const { search, status, sort, limit = 50, offset = 0 } = req.query;

    logger.info(`Récupération des produits pour ${shop}`);

    // Vérifier d'abord si le token est valide
    try {
      const testResponse = await fetch(`https://${shop}/admin/api/2025-04/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });
      
      if (!testResponse.ok) {
        logger.error(`Token invalide pour ${shop}: ${testResponse.status}`);
        await tokenStore.removeToken(shop);
        
        return res.status(401).json({
          error: 'Token d\'accès expiré',
          message: 'Veuillez réinstaller l\'application pour renouveler l\'accès',
          requiresReinstall: true,
          redirectUrl: `/api/auth/install?shop=${shop}`
        });
      }
    } catch (tokenError) {
      logger.error('Erreur lors de la vérification du token:', tokenError);
      return res.status(401).json({
        error: 'Token d\'accès invalide',
        message: 'Veuillez réinstaller l\'application',
        requiresReinstall: true,
        redirectUrl: `/api/auth/install?shop=${shop}`
      });
    }

    // Récupérer les produits directement depuis Shopify
    const products = await shopifySimpleService.getProductsFromShopify(shop, accessToken, {
      search,
      status,
      sort,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      products: products || [],
      total: products?.length || 0,
      source: 'shopify'
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des produits:', error);
    
    // Gestion spécifique des erreurs 401
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      const { shop } = req.shopifySession;
      await tokenStore.removeToken(shop);
      
      return res.status(401).json({
        error: 'Token d\'accès expiré',
        message: 'Veuillez réinstaller l\'application pour renouveler l\'accès',
        requiresReinstall: true,
        redirectUrl: `/api/auth/install?shop=${shop}`
      });
    }
    
    res.status(500).json({
      error: 'Impossible de récupérer les produits',
      message: error.message
    });
  }
});

// Récupérer un produit spécifique
router.get('/:id', shopifyAuth, async (req, res) => {
  try {
    const { shop, accessToken } = req.shopifySession;
    const { id } = req.params;

    const product = await shopifySimpleService.getProductById(shop, accessToken, id);

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      });
    }

    res.json({ product });
  } catch (error) {
    logger.error(`Erreur lors de la récupération du produit ${req.params.id}:`, error);
    
    // Gestion spécifique des erreurs 401
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      const { shop } = req.shopifySession;
      await tokenStore.removeToken(shop);
      
      return res.status(401).json({
        error: 'Token d\'accès expiré',
        message: 'Veuillez réinstaller l\'application pour renouveler l\'accès',
        requiresReinstall: true,
        redirectUrl: `/api/auth/install?shop=${shop}`
      });
    }
    
    res.status(500).json({
      error: 'Impossible de récupérer le produit',
      message: error.message
    });
  }
});

export default router; 