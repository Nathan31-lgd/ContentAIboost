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
    // Pour l'instant, retourner des données de test
    const products = [
      {
        id: '1',
        title: 'Produit de test 1',
        description: 'Description du produit de test',
        seo_score: 75,
        status: 'active',
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Produit de test 2',
        description: 'Autre description de produit',
        seo_score: 60,
        status: 'active',
        updated_at: new Date().toISOString()
      }
    ];

    res.json({
      products,
      total: products.length,
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