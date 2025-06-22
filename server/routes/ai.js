import express from 'express';
import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { checkSubscriptionLimits, checkAIApiKey } from '../middleware/auth.js';
import aiService from '../services/aiService.js';
import seoService from '../services/seoService.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../shared/constants/index.js';
import { AIProviderTypes } from '../../shared/types/index.js';

const router = express.Router();

// Test d'une clé API IA
router.post('/test-key', async (req, res) => {
  try {
    const { provider, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({
        error: 'Paramètres manquants',
        message: 'Le fournisseur et la clé API sont requis'
      });
    }

    // TODO: Implémenter la validation des clés API
    logger.info(`Test de clé API ${provider}`);

    res.json({
      valid: true,
      provider,
      message: 'Clé API valide'
    });
  } catch (error) {
    logger.error('Erreur lors du test de la clé API:', error);
    res.status(500).json({
      error: 'Erreur lors du test de la clé API'
    });
  }
});

// Analyser du contenu avec l'IA
router.post('/analyze', checkSubscriptionLimits('optimization'), checkAIApiKey('openai'), asyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const { 
      content, 
      provider = 'openai',
      type = 'product' // 'product' ou 'collection'
    } = req.body;

    if (!content || !content.title) {
      return res.status(400).json({
        error: 'Contenu manquant',
        message: 'Le titre du contenu est requis'
      });
    }

    // Initialiser le service IA
    aiService.initializeProvider(provider, user.aiApiKeys[provider]);

    // Analyser le contenu
    const analysis = await aiService.analyzeContent(provider, {
      title: content.title,
      description: content.description || '',
      tags: content.tags || [],
      collections: content.collections || [],
      images: content.images || []
    });

    // Calculer le score SEO actuel
    const currentSeoScore = seoService.calculateSEOScore({
      title: content.title,
      description: content.description || '',
      keywords: content.tags || [],
      images: content.images || [],
      h1: content.title,
      h2: content.h2 || [],
      h3: content.h3 || []
    });

    // Calculer le score SEO optimisé
    const optimizedSeoScore = seoService.calculateSEOScore({
      title: analysis.title,
      description: analysis.description,
      keywords: analysis.keywords,
      images: content.images || [],
      h1: analysis.title,
      h2: content.h2 || [],
      h3: content.h3 || []
    });

    logger.info(`🔍 Contenu analysé avec ${provider} pour ${user.shop}`);

    res.json({
      analysis,
      seoScores: {
        current: currentSeoScore.totalScore,
        optimized: optimizedSeoScore.totalScore,
        improvement: optimizedSeoScore.totalScore - currentSeoScore.totalScore
      },
      seoDetails: {
        current: currentSeoScore.details,
        optimized: optimizedSeoScore.details
      }
    });
  } catch (error) {
    logger.error('Erreur lors de l\'analyse du contenu:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.AI_API_ERROR,
      message: 'Erreur lors de l\'analyse du contenu'
    });
  }
}));

// Générer des mots-clés
router.post('/keywords', async (req, res) => {
  try {
    const { shopId } = req.user;
    const { content, provider = 'openai' } = req.body;

    // TODO: Implémenter la génération de mots-clés avec IA
    const keywords = ['exemple', 'mot-clé', 'test'];

    res.json({
      keywords,
      provider
    });
  } catch (error) {
    logger.error('Erreur lors de la génération de mots-clés:', error);
    res.status(500).json({
      error: 'Erreur lors de la génération de mots-clés'
    });
  }
});

// Optimiser un titre SEO
router.post('/optimize-title', checkSubscriptionLimits('optimization'), checkAIApiKey('openai'), asyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const { 
      content, 
      provider = 'openai'
    } = req.body;

    if (!content || !content.title) {
      return res.status(400).json({
        error: 'Titre manquant',
        message: 'Le titre est requis'
      });
    }

    // Initialiser le service IA
    aiService.initializeProvider(provider, user.aiApiKeys[provider]);

    // Optimiser le titre
    const optimizedTitle = await aiService.optimizeTitle(provider, {
      title: content.title,
      description: content.description || '',
      tags: content.tags || [],
      collections: content.collections || []
    });

    // Calculer les scores SEO
    const currentScore = seoService.calculateTitleScore(content.title);
    const optimizedScore = seoService.calculateTitleScore(optimizedTitle);

    logger.info(`📝 Titre optimisé avec ${provider} pour ${user.shop}`);

    res.json({
      originalTitle: content.title,
      optimizedTitle,
      scores: {
        current: currentScore,
        optimized: optimizedScore,
        improvement: optimizedScore - currentScore
      },
      provider
    });
  } catch (error) {
    logger.error('Erreur lors de l\'optimisation du titre:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.AI_API_ERROR,
      message: 'Erreur lors de l\'optimisation du titre'
    });
  }
}));

// Optimiser une description SEO
router.post('/optimize-description', checkSubscriptionLimits('optimization'), checkAIApiKey('openai'), asyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const { 
      content, 
      provider = 'openai'
    } = req.body;

    if (!content || !content.title) {
      return res.status(400).json({
        error: 'Contenu manquant',
        message: 'Le titre est requis'
      });
    }

    // Initialiser le service IA
    aiService.initializeProvider(provider, user.aiApiKeys[provider]);

    // Optimiser la description
    const optimizedDescription = await aiService.optimizeDescription(provider, {
      title: content.title,
      description: content.description || '',
      tags: content.tags || [],
      collections: content.collections || []
    });

    // Calculer les scores SEO
    const currentScore = seoService.calculateDescriptionScore(content.description || '');
    const optimizedScore = seoService.calculateDescriptionScore(optimizedDescription);

    logger.info(`📝 Description optimisée avec ${provider} pour ${user.shop}`);

    res.json({
      originalDescription: content.description || '',
      optimizedDescription,
      scores: {
        current: currentScore,
        optimized: optimizedScore,
        improvement: optimizedScore - currentScore
      },
      provider
    });
  } catch (error) {
    logger.error('Erreur lors de l\'optimisation de la description:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.AI_API_ERROR,
      message: 'Erreur lors de l\'optimisation de la description'
    });
  }
}));

// Optimiser le texte alternatif d'une image
router.post('/optimize-image-alt', checkSubscriptionLimits('optimization'), checkAIApiKey('openai'), asyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const { 
      content, 
      imageData,
      provider = 'openai'
    } = req.body;

    if (!content || !content.title || !imageData) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Le titre du contenu et les données de l\'image sont requis'
      });
    }

    // Initialiser le service IA
    aiService.initializeProvider(provider, user.aiApiKeys[provider]);

    // Optimiser le texte alternatif
    const optimizedAlt = await aiService.optimizeImageAlt(provider, imageData, {
      title: content.title,
      description: content.description || '',
      tags: content.tags || [],
      collections: content.collections || []
    });

    logger.info(`🖼️ Texte alternatif optimisé avec ${provider} pour ${user.shop}`);

    res.json({
      originalAlt: imageData.alt || '',
      optimizedAlt,
      provider
    });
  } catch (error) {
    logger.error('Erreur lors de l\'optimisation du texte alternatif:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.AI_API_ERROR,
      message: 'Erreur lors de l\'optimisation du texte alternatif'
    });
  }
}));

// Analyser la densité de mots-clés
router.post('/keyword-density', asyncHandler(async (req, res) => {
  try {
    const { content, keywords } = req.body;

    if (!content || !keywords || !Array.isArray(keywords)) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Le contenu et la liste de mots-clés sont requis'
      });
    }

    const allText = `${content.title} ${content.description || ''}`;
    const keywordDensity = seoService.analyzeKeywordDensity(allText, keywords);

    // Calculer les statistiques
    const totalWords = allText.split(' ').length;
    const totalKeywordOccurrences = Object.values(keywordDensity).reduce((sum, data) => sum + data.count, 0);
    const averageDensity = totalWords > 0 ? (totalKeywordOccurrences / totalWords) * 100 : 0;

    res.json({
      keywordDensity,
      statistics: {
        totalWords,
        totalKeywordOccurrences,
        averageDensity: Math.round(averageDensity * 100) / 100,
        keywordsAnalyzed: keywords.length
      }
    });
  } catch (error) {
    logger.error('Erreur lors de l\'analyse de la densité de mots-clés:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.UNKNOWN_ERROR,
      message: 'Erreur lors de l\'analyse de la densité de mots-clés'
    });
  }
}));

// Suggérer des améliorations SEO
router.post('/suggestions', asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.title) {
      return res.status(400).json({
        error: 'Contenu manquant',
        message: 'Le titre du contenu est requis'
      });
    }

    // Calculer le score SEO actuel
    const seoScore = seoService.calculateSEOScore({
      title: content.title,
      description: content.description || '',
      keywords: content.tags || [],
      images: content.images || [],
      h1: content.title,
      h2: content.h2 || [],
      h3: content.h3 || []
    });

    // Générer les suggestions
    const suggestions = seoService.suggestImprovements({
      title: content.title,
      description: content.description || '',
      keywords: content.tags || [],
      images: content.images || [],
      h1: content.title,
      h2: content.h2 || [],
      h3: content.h3 || []
    });

    res.json({
      seoScore: seoScore.totalScore,
      suggestions,
      details: seoScore.details,
      scores: seoScore.scores
    });
  } catch (error) {
    logger.error('Erreur lors de la génération des suggestions:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.UNKNOWN_ERROR,
      message: 'Erreur lors de la génération des suggestions'
    });
  }
}));

// Tester la connectivité des services IA
router.get('/providers/status', asyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const status = {};

    // Tester chaque fournisseur configuré
    for (const [provider, apiKey] of Object.entries(user.aiApiKeys)) {
      if (apiKey) {
        try {
          const isValid = await aiService.validateApiKey(provider, apiKey);
          status[provider] = {
            configured: true,
            valid: isValid,
            status: isValid ? 'connected' : 'invalid_key'
          };
        } catch (error) {
          status[provider] = {
            configured: true,
            valid: false,
            status: 'error',
            error: error.message
          };
        }
      } else {
        status[provider] = {
          configured: false,
          valid: false,
          status: 'not_configured'
        };
      }
    }

    res.json({ providers: status });
  } catch (error) {
    logger.error('Erreur lors de la vérification du statut des fournisseurs:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.UNKNOWN_ERROR,
      message: 'Erreur lors de la vérification du statut des fournisseurs'
    });
  }
}));

export default router; 