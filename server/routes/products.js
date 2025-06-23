import express from 'express';
import { logger } from '../utils/logger.js';
import shopifySimpleService from '../services/shopifySimpleService.js';
import { shopifyAuth } from '../middleware/shopifyAuth.js';

const router = express.Router();

// Synchroniser les produits depuis Shopify (automatique)
router.post('/sync', shopifyAuth, async (req, res) => {
  try {
    const { shop, accessToken } = req.shopifySession;
    
    logger.info(`Synchronisation automatique demandée pour ${shop}`);
    
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
    res.status(500).json({
      error: 'Impossible de récupérer le produit',
      message: error.message
    });
  }
});

export default router; 