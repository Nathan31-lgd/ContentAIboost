import express from 'express';
import { logger } from '../utils/logger.js';
import shopifySimpleService from '../services/shopifySimpleService.js';
import tokenStore from '../services/tokenStore.js';

const router = express.Router();

// Données de test pour les produits (fallback)
const mockProducts = [
  {
    id: '1',
    title: 'T-shirt Premium',
    description: 'Un t-shirt de qualité supérieure en coton bio',
    price: '29.99€',
    image: 'https://via.placeholder.com/150',
    seo_score: 75,
    status: 'active',
    optimized: false,
  },
  {
    id: '2', 
    title: 'Jean Slim Fit',
    description: 'Jean moderne avec coupe ajustée',
    price: '79.99€',
    image: 'https://via.placeholder.com/150',
    seo_score: 85,
    status: 'active',
    optimized: true,
  },
  {
    id: '3',
    title: 'Sneakers Urbaines',
    description: 'Chaussures confortables pour la ville',
    price: '120.00€',
    image: 'https://via.placeholder.com/150',
    seo_score: 60,
    status: 'active',
    optimized: false,
  },
  {
    id: '4',
    title: 'Veste en Cuir',
    description: 'Veste élégante en cuir véritable',
    price: '199.99€',
    image: 'https://via.placeholder.com/150',
    seo_score: 90,
    status: 'active',
    optimized: true,
  },
  {
    id: '5',
    title: 'Montre Classique',
    description: 'Montre intemporelle avec bracelet en acier',
    price: '299.00€',
    image: 'https://via.placeholder.com/150',
    seo_score: 45,
    status: 'active',
    optimized: false,
  },
];

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
    
    if (accessToken) {
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
    } else {
      logger.warn(`Aucun token trouvé pour ${shop} - utilisation des données de test`);
      return res.json({
        success: true,
        message: `${mockProducts.length} produits synchronisés (mode test - pas d'authentification)`,
        count: mockProducts.length,
        source: 'test',
        needsAuth: true
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
    
    logger.info(`Récupération des produits pour ${shop}, token présent: ${!!accessToken}`);
    
    if (accessToken) {
      try {
        const result = await shopifySimpleService.getProducts(shop, accessToken, req.query);
        logger.info(`✅ ${result.products.length} produits récupérés depuis Shopify`);
        return res.json({
          ...result,
          source: 'shopify'
        });
      } catch (shopifyError) {
        logger.error('Erreur lors de la récupération des produits Shopify:', shopifyError);
        logger.info('Utilisation des données de test comme fallback');
      }
    } else {
      logger.info(`Pas de token pour ${shop} - utilisation des données de test`);
    }
    
    // Fallback : utiliser les données de test
    const { search = '', status = '', sort = 'title' } = req.query;
    
    let filteredProducts = [...mockProducts];
    
    // Appliquer le filtre de recherche
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Appliquer le filtre de statut
    if (status) {
      const statusFilters = status.split(',');
      if (statusFilters.includes('optimized')) {
        filteredProducts = filteredProducts.filter(product => product.optimized);
      }
      if (statusFilters.includes('not_optimized')) {
        filteredProducts = filteredProducts.filter(product => !product.optimized);
      }
    }
    
    // Appliquer le tri
    filteredProducts.sort((a, b) => {
      switch (sort) {
        case 'price':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'seo_score':
          return b.seo_score - a.seo_score;
        default:
          return a.title.localeCompare(b.title);
      }
    });
    
    const result = {
      products: filteredProducts,
      total: filteredProducts.length,
      page: 1,
      limit: 20,
      source: 'test',
      needsAuth: !accessToken
    };
    
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
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Paramètre shop manquant' });
    }

    // Récupérer le token depuis notre store
    const accessToken = tokenStore.getToken(shop);

    if (accessToken) {
      try {
        const product = await shopifySimpleService.getProduct(shop, accessToken, id);
        if (product) {
          logger.info(`Produit ${id} trouvé sur Shopify pour ${shop}`);
          return res.json({
            ...product,
            source: 'shopify'
          });
        }
      } catch (shopifyError) {
        logger.error(`Erreur lors de la récupération du produit ${id} sur Shopify:`, shopifyError);
      }
    }

    // Fallback : données de test
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    logger.info(`Produit ${id} trouvé (données de test) pour ${shop}`);
    res.json({
      ...product,
      source: 'test',
      needsAuth: !accessToken
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération du produit ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du produit'
    });
  }
});

export default router; 