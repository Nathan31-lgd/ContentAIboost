import express from 'express';
import { logger } from '../utils/logger.js';
import shopifySimpleService from '../services/shopifySimpleService.js';
import tokenStore from '../services/tokenStore.js';

const router = express.Router();

// Synchroniser les collections depuis Shopify
router.post('/sync', async (req, res) => {
  try {
    const { shop } = req.query;

    if (!shop) {
      return res.status(400).json({ error: 'Paramètre shop manquant' });
    }

    // Récupérer le token d'accès
    const accessToken = await tokenStore.getToken(shop);
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Token d\'accès non trouvé. Veuillez réinstaller l\'app.',
        requiresAuth: true 
      });
    }

    logger.info(`Synchronisation des collections pour ${shop}`);

    // Récupérer les collections depuis Shopify
    const collections = await shopifySimpleService.getCollectionsFromShopify(shop, accessToken);

    logger.info(`✅ Synchronisation réussie: ${collections.length} collections`);

    res.json({
      success: true,
      message: `${collections.length} collections synchronisées avec succès`,
      count: collections.length
    });

  } catch (error) {
    logger.error('Erreur lors de la synchronisation des collections:', error);
    res.status(500).json({
      error: 'Erreur lors de la synchronisation des collections',
      details: error.message
    });
  }
});

// Récupérer la liste des collections
router.get('/', async (req, res) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Paramètre shop manquant' });
    }

    const { page = 1, limit = 20, search = '', status = '', sort = 'title', direction = 'asc' } = req.query;

    // Récupérer le token d'accès
    const accessToken = await tokenStore.getToken(shop);
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Token d\'accès non trouvé. Veuillez réinstaller l\'app.',
        requiresAuth: true 
      });
    }

    logger.info(`Récupération des collections pour ${shop}`);

    // Obtenir les collections depuis Shopify
    const result = await shopifySimpleService.getCollections(shop, accessToken, {
      page,
      limit,
      search,
      status,
      sort,
      direction
    });

    logger.info(`Retour de ${result.collections.length} collections`);
    res.json({
      ...result,
      source: 'shopify' // Indiquer la source des données
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des collections:', error);
    
    // Si erreur d'authentification
    if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return res.status(401).json({
        error: 'Authentification Shopify requise',
        requiresAuth: true,
        details: error.message
      });
    }
    
    res.status(500).json({
      error: 'Erreur lors de la récupération des collections',
      details: error.message
    });
  }
});

// Récupérer une collection spécifique
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Paramètre shop manquant' });
    }

    // Récupérer le token d'accès
    const accessToken = await tokenStore.getToken(shop);
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Token d\'accès non trouvé. Veuillez réinstaller l\'app.',
        requiresAuth: true 
      });
    }

    // Récupérer la collection depuis Shopify
    const collection = await shopifySimpleService.getCollectionById(shop, accessToken, id);
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection non trouvée' });
    }

    logger.info(`Collection ${id} trouvée pour ${shop}`);
    res.json(collection);

  } catch (error) {
    logger.error('Erreur lors de la récupération de la collection:', error);
    
    if (error.message?.includes('404')) {
      return res.status(404).json({ error: 'Collection non trouvée' });
    }
    
    res.status(500).json({
      error: 'Erreur lors de la récupération de la collection',
      details: error.message
    });
  }
});

export default router; 