import express from 'express';
import { logger } from '../utils/logger.js';
import shopifyService from '../services/shopifyService.js';
import prisma from '../config/prisma.js';

const router = express.Router();

// Synchroniser les produits depuis Shopify
router.post('/sync', async (req, res) => {
  try {
    const { shop, accessToken } = res.locals.shopify.session;
    
    if (!shop || !accessToken) {
      return res.status(401).json({ error: 'Session Shopify invalide' });
    }

    const products = await shopifyService.syncProducts(shop, accessToken);

    res.json({
      success: true,
      message: `${products.length} produits synchronisés`,
      count: products.length
    });
  } catch (error) {
    logger.error('Erreur lors de la synchronisation des produits:', error);
    res.status(500).json({
      error: 'Erreur lors de la synchronisation des produits'
    });
  }
});

// Récupérer la liste des produits
router.get('/', async (req, res) => {
  try {
    const { shop, accessToken } = res.locals.shopify.session;
    
    if (!shop) {
      return res.status(401).json({ error: 'Session Shopify invalide' });
    }

    const productCount = await prisma.product.count({
      where: { shopDomain: shop },
    });
    
    if (productCount === 0) {
      logger.info(`Aucun produit local trouvé pour ${shop}, lancement de la synchronisation initiale...`);
      if (accessToken) {
        await shopifyService.syncProducts(shop, accessToken);
      } else {
        logger.warn(`Impossible de synchroniser, token d'accès manquant pour ${shop}`);
      }
    }

    const products = await shopifyService.getProducts(shop, req.query);
    
    res.json(products);
  } catch (error) {
    logger.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des produits'
    });
  }
});

// Récupérer un produit spécifique
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { shop } = res.locals.shopify.session;
    
    if (!shop) {
      return res.status(401).json({ error: 'Session Shopify invalide' });
    }

    const product = await shopifyService.getProduct(shop, id);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json(product);
  } catch (error) {
    logger.error(`Erreur lors de la récupération du produit ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du produit'
    });
  }
});

export default router; 