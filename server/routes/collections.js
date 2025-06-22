import express from 'express';
import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Récupérer la liste des collections
router.get('/', async (req, res) => {
  try {
    const { shopId } = req.user;
    const { page = 1, limit = 20, search, status, sort = 'title', direction = 'asc' } = req.query;

    // TODO: Intégrer avec l'API Shopify pour récupérer les vraies collections
    // Pour l'instant, retourner des données de test
    const collections = [
      {
        id: '1',
        title: 'Collection de test 1',
        description: 'Description de la collection de test',
        seo_score: 65,
        products_count: 12,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Collection de test 2',
        description: 'Autre description de collection',
        seo_score: 80,
        products_count: 8,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    res.json({
      collections,
      total: collections.length,
      page: parseInt(page),
      totalPages: 1
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des collections:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des collections'
    });
  }
});

// Récupérer une collection spécifique
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { shopId } = req.user;

    // TODO: Intégrer avec l'API Shopify
    const collection = {
      id,
      title: `Collection ${id}`,
      description: 'Description de la collection',
      seo_score: 75,
      products_count: 10,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.json(collection);
  } catch (error) {
    logger.error('Erreur lors de la récupération de la collection:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la collection'
    });
  }
});

export default router; 