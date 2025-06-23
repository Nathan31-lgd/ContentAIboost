import express from 'express';
import { logger } from '../utils/logger.js';
import shopifySimpleService from '../services/shopifySimpleService.js';
import tokenStore from '../services/tokenStore.js';

const router = express.Router();

// Synchroniser les produits depuis Shopify
router.post('/sync', async (req, res) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Paramètre shop manquant' });
    }

    logger.info(`Synchronisation demandée pour ${shop}`);
    
    // Récupérer le token depuis notre store
    const accessToken = tokenStore.getToken(shop);
    
    if (!accessToken) {
      return res.status(401).json({
        error: 'Authentification requise',
        message: 'Veuillez connecter votre boutique Shopify pour synchroniser les produits',
        needsAuth: true
      });
    }

    try {
      const result = await shopifySimpleService.getProducts(shop, accessToken);
      logger.info(`✅ ${result.total} produits synchronisés depuis Shopify pour ${shop}`);
      return res.json({
        success: true,
        message: `${result.total} produits récupérés depuis Shopify`,
        count: result.total,
        source: 'shopify'
      });
    } catch (shopifyError) {
      logger.error('Erreur Shopify lors de la synchronisation:', shopifyError);
      return res.status(500).json({
        error: 'Erreur lors de la synchronisation avec Shopify',
        details: shopifyError.message
      });
    }
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
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Paramètre shop manquant' });
    }

    // Récupérer le token depuis notre store
    const accessToken = tokenStore.getToken(shop);
    
    if (!accessToken) {
      return res.status(401).json({
        error: 'Authentification requise',
        message: 'Veuillez connecter votre boutique Shopify pour voir vos produits',
        needsAuth: true,
        products: [],
        total: 0
      });
    }

    logger.info(`Récupération des produits pour ${shop}`);
    
    try {
      const result = await shopifySimpleService.getProducts(shop, accessToken, req.query);
      logger.info(`✅ ${result.products.length} produits récupérés depuis Shopify`);
      return res.json({
        ...result,
        source: 'shopify'
      });
    } catch (shopifyError) {
      logger.error('Erreur lors de la récupération des produits Shopify:', shopifyError);
      return res.status(500).json({
        error: 'Erreur lors de la récupération des produits depuis Shopify',
        message: 'Impossible de récupérer les produits. Vérifiez votre connexion Shopify.',
        details: shopifyError.message
      });
    }
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
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Paramètre shop manquant' });
    }

    // Récupérer le token depuis notre store
    const accessToken = tokenStore.getToken(shop);

    if (!accessToken) {
      return res.status(401).json({
        error: 'Authentification requise',
        message: 'Veuillez connecter votre boutique Shopify pour voir ce produit',
        needsAuth: true
      });
    }

    try {
      const product = await shopifySimpleService.getProduct(shop, accessToken, id);
      if (!product) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }
      
      logger.info(`Produit ${id} trouvé sur Shopify pour ${shop}`);
      return res.json({
        ...product,
        source: 'shopify'
      });
    } catch (shopifyError) {
      logger.error(`Erreur lors de la récupération du produit ${id} sur Shopify:`, shopifyError);
      return res.status(500).json({
        error: 'Erreur lors de la récupération du produit depuis Shopify',
        message: 'Impossible de récupérer ce produit. Vérifiez votre connexion Shopify.',
        details: shopifyError.message
      });
    }
  } catch (error) {
    logger.error(`Erreur lors de la récupération du produit ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du produit'
    });
  }
});

export default router; 