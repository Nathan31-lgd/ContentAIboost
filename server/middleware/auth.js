import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token manquant',
        message: 'Authentification requise'
      });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer les informations de la boutique depuis Prisma
    const shop = await prisma.shop.findUnique({
      where: { shopifyDomain: decoded.shop },
      select: { 
        id: true, 
        shopifyDomain: true, 
        email: true, 
        plan: true 
      }
    });
    
    if (!shop) {
      return res.status(401).json({
        error: 'Boutique non trouvée',
        message: 'Session invalide'
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      shopId: shop.id,
      shop: shop.shopifyDomain,
      email: shop.email,
      plan: shop.plan
    };
    
    next();
  } catch (error) {
    logger.error('Erreur d\'authentification:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide',
        message: 'Session expirée ou invalide'
      });
    }
    
    return res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la vérification de l\'authentification'
    });
  }
};

// Middleware pour vérifier les limites du plan d'abonnement
export const checkSubscriptionLimits = (operation) => {
  return async (req, res, next) => {
    try {
      const { user } = req;
      const { SUBSCRIPTION_LIMITS } = await import('../../shared/constants/index.js');
      
      const limits = SUBSCRIPTION_LIMITS[user.plan.toUpperCase()];
      
      if (!limits) {
        return res.status(400).json({ 
          error: 'Plan d\'abonnement invalide' 
        });
      }

      // Vérifier les limites quotidiennes
      if (limits.dailyOptimizations !== -1 && user.usage.dailyOptimizations >= limits.dailyOptimizations) {
        return res.status(429).json({ 
          error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          message: `Limite quotidienne atteinte (${limits.dailyOptimizations} optimisations)`
        });
      }

      // Vérifier les opérations en masse pour le plan gratuit
      if (operation === 'bulk' && !limits.bulkOperations) {
        return res.status(403).json({ 
          error: 'Opération non autorisée',
          message: 'Les opérations en masse nécessitent un plan Premium'
        });
      }

      next();
    } catch (error) {
      logger.error('Erreur lors de la vérification des limites:', error);
      return res.status(500).json({ 
        error: ERROR_MESSAGES.UNKNOWN_ERROR 
      });
    }
  };
};

// Middleware pour vérifier la présence d'une clé API IA
export const checkAIApiKey = (provider) => {
  return async (req, res, next) => {
    try {
      const { user } = req;
      
      if (!user.aiApiKeys[provider]) {
        return res.status(400).json({ 
          error: 'Clé API manquante',
          message: `Veuillez configurer votre clé API ${provider.toUpperCase()} dans les paramètres`
        });
      }

      next();
    } catch (error) {
      logger.error('Erreur lors de la vérification de la clé API:', error);
      return res.status(500).json({ 
        error: ERROR_MESSAGES.UNKNOWN_ERROR 
      });
    }
  };
}; 