import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Données de test pour les collections
const mockCollections = [
  {
    id: '1',
    title: 'Vêtements Homme',
    description: 'Collection complète de vêtements pour hommes',
    seo_score: 85,
    products_count: 24,
    published_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-06-20').toISOString(),
    handle: 'vetements-homme',
    image: 'https://via.placeholder.com/300x200',
    optimized: true
  },
  {
    id: '2',
    title: 'Vêtements Femme',
    description: 'Tendances mode pour femmes',
    seo_score: 75,
    products_count: 32,
    published_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date('2024-06-18').toISOString(),
    handle: 'vetements-femme',
    image: 'https://via.placeholder.com/300x200',
    optimized: false
  },
  {
    id: '3',
    title: 'Accessoires',
    description: 'Accessoires de mode et lifestyle',
    seo_score: 60,
    products_count: 18,
    published_at: new Date('2024-02-01').toISOString(),
    updated_at: new Date('2024-06-15').toISOString(),
    handle: 'accessoires',
    image: 'https://via.placeholder.com/300x200',
    optimized: false
  },
  {
    id: '4',
    title: 'Chaussures',
    description: 'Collection de chaussures pour tous styles',
    seo_score: 90,
    products_count: 16,
    published_at: new Date('2024-02-10').toISOString(),
    updated_at: new Date('2024-06-22').toISOString(),
    handle: 'chaussures',
    image: 'https://via.placeholder.com/300x200',
    optimized: true
  }
];

// Récupérer la liste des collections
router.get('/', async (req, res) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Paramètre shop manquant' });
    }

    const { page = 1, limit = 20, search = '', status = '', sort = 'title', direction = 'asc' } = req.query;

    logger.info(`Récupération des collections pour ${shop}`);

    // Filtrer les collections selon les paramètres
    let filteredCollections = [...mockCollections];
    
    // Appliquer le filtre de recherche
    if (search) {
      filteredCollections = filteredCollections.filter(collection =>
        collection.title.toLowerCase().includes(search.toLowerCase()) ||
        collection.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Appliquer le filtre de statut
    if (status) {
      const statusFilters = status.split(',');
      if (statusFilters.includes('optimized')) {
        filteredCollections = filteredCollections.filter(collection => collection.optimized);
      }
      if (statusFilters.includes('not_optimized')) {
        filteredCollections = filteredCollections.filter(collection => !collection.optimized);
      }
    }
    
    // Appliquer le tri
    filteredCollections.sort((a, b) => {
      let comparison = 0;
      switch (sort) {
        case 'products_count':
          comparison = a.products_count - b.products_count;
          break;
        case 'seo_score':
          comparison = a.seo_score - b.seo_score;
          break;
        case 'updated_at':
          comparison = new Date(a.updated_at) - new Date(b.updated_at);
          break;
        default:
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return direction === 'desc' ? -comparison : comparison;
    });

    const result = {
      collections: filteredCollections,
      total: filteredCollections.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredCollections.length / parseInt(limit))
    };

    logger.info(`Retour de ${filteredCollections.length} collections`);
    res.json(result);
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
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Paramètre shop manquant' });
    }

    const collection = mockCollections.find(c => c.id === id);
    if (!collection) {
      return res.status(404).json({ error: 'Collection non trouvée' });
    }

    logger.info(`Collection ${id} trouvée pour ${shop}`);
    res.json(collection);
  } catch (error) {
    logger.error('Erreur lors de la récupération de la collection:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la collection'
    });
  }
});

export default router; 