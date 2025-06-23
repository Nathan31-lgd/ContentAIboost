import express from 'express';
import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Récupérer la liste des produits
router.get('/', async (req, res) => {
  try {
    const { shopId } = req.user;
    const { page = 1, limit = 20, search, status, sort = 'title', direction = 'asc' } = req.query;

    // TODO: Intégrer avec l'API Shopify pour récupérer les vrais produits
    // Pour l'instant, retourner des données de test enrichies
    const products = [
      {
        id: '1',
        title: 'T-shirt Premium Coton Bio',
        description: 'T-shirt confortable en coton biologique, parfait pour un usage quotidien',
        price: '29,99 €',
        image: 'https://via.placeholder.com/150',
        seo_score: 85,
        status: 'active',
        optimized: true,
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Jean Slim Fit',
        description: 'Jean moderne avec une coupe ajustée',
        price: '79,99 €',
        image: 'https://via.placeholder.com/150',
        seo_score: 45,
        status: 'active',
        optimized: false,
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Sneakers Sport Confort',
        description: 'Chaussures de sport légères et confortables',
        price: '99,99 €',
        image: 'https://via.placeholder.com/150',
        seo_score: 72,
        status: 'active',
        optimized: false,
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Veste Imperméable',
        description: 'Protection optimale contre la pluie',
        price: '149,99 €',
        image: 'https://via.placeholder.com/150',
        seo_score: 30,
        status: 'active',
        optimized: false,
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        title: 'Sac à Dos Urbain',
        description: 'Sac pratique pour la ville avec compartiment ordinateur',
        price: '59,99 €',
        image: 'https://via.placeholder.com/150',
        seo_score: 90,
        status: 'active',
        optimized: true,
        updated_at: new Date().toISOString()
      }
    ];

    // Filtrer par recherche si nécessaire
    let filteredProducts = products;
    if (search) {
      filteredProducts = products.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      products: filteredProducts,
      total: filteredProducts.length,
      page: parseInt(page),
      totalPages: 1
    });
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
    const { shopId } = req.user;

    // TODO: Intégrer avec l'API Shopify
    const product = {
      id,
      title: `Produit ${id}`,
      description: 'Description du produit',
      seo_score: 70,
      status: 'active',
      updated_at: new Date().toISOString()
    };

    res.json(product);
  } catch (error) {
    logger.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du produit'
    });
  }
});

export default router; 