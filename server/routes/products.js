import express from 'express';
import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import shopifyService from '../services/shopifyService.js';

const router = express.Router();

// Synchroniser les produits depuis Shopify
router.post('/sync', async (req, res) => {
  try {
    const shop = req.user?.shop;
    
    if (!shop) {
      return res.status(400).json({
        error: 'Informations de la boutique manquantes'
      });
    }

    // Récupérer le token d'accès depuis la base de données
    const shopData = await prisma.shop.findUnique({
      where: { shopifyDomain: shop },
      select: { shopifyAccessToken: true }
    });

    if (!shopData?.shopifyAccessToken) {
      return res.status(401).json({
        error: 'Token d\'accès Shopify non trouvé'
      });
    }

    // Synchroniser les produits
    const products = await shopifyService.syncProducts(shop, shopData.shopifyAccessToken);

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
    const shop = req.user?.shop;
    
    if (!shop) {
      return res.status(400).json({
        error: 'Informations de la boutique manquantes'
      });
    }

    // Vérifier si des produits existent en base
    const productCount = await prisma.product.count({
      where: { shopDomain: shop }
    });

    // Si aucun produit, lancer une synchronisation automatique
    if (productCount === 0) {
      const shopData = await prisma.shop.findUnique({
        where: { shopifyDomain: shop },
        select: { shopifyAccessToken: true }
      });

      if (shopData?.shopifyAccessToken) {
        try {
          await shopifyService.syncProducts(shop, shopData.shopifyAccessToken);
        } catch (syncError) {
          logger.error('Erreur lors de la synchronisation automatique:', syncError);
        }
      }
    }

    // Récupérer les produits depuis la base de données
    const result = await shopifyService.getProducts(shop, req.query);
    
    res.json(result);
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
    const shop = req.user?.shop;
    
    if (!shop) {
      return res.status(400).json({
        error: 'Informations de la boutique manquantes'
      });
    }

    const product = await shopifyService.getProduct(shop, id);
    res.json(product);
  } catch (error) {
    logger.error('Erreur lors de la récupération du produit:', error);
    if (error.message === 'Produit non trouvé') {
      res.status(404).json({ error: 'Produit non trouvé' });
    } else {
      res.status(500).json({
        error: 'Erreur lors de la récupération du produit'
      });
    }
  }
});

export default router; 