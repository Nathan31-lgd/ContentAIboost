import express from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const router = express.Router();

// Obtenir les paramètres de l'utilisateur (clés API, etc.)
router.get('/settings', asyncHandler(async (req, res) => {
  const { shopId } = req.user; // Injecté par le middleware d'auth

  const apiKeys = await prisma.apiKey.findMany({
    where: { shopId: shopId },
  });

  const decryptedApiKeys = apiKeys.reduce((acc, apiKey) => {
    acc[apiKey.provider] = decrypt(apiKey.key);
    return acc;
  }, {});

  // Vous pouvez ajouter d'autres préférences ici
  const preferences = {
    language: 'fr',
    defaultAiProvider: 'openai'
  };

  res.json({ apiKeys: decryptedApiKeys, preferences });
}));

// Mettre à jour les paramètres de l'utilisateur
router.put('/settings', asyncHandler(async (req, res) => {
  const { shopId } = req.user;
  const { apiKeys } = req.body; // { openai: '...', anthropic: '...' }

  if (!apiKeys || typeof apiKeys !== 'object') {
    return res.status(400).json({ message: 'Invalid apiKeys format' });
  }

  const upsertPromises = Object.entries(apiKeys).map(([provider, key]) => {
    if (typeof key !== 'string' || key.trim() === '') {
      // Optionnel: supprimer la clé si elle est vide
      return prisma.apiKey.deleteMany({
        where: { shopId: shopId, provider: provider },
      });
    }
    
    const encryptedKey = encrypt(key);

    return prisma.apiKey.upsert({
      where: { shopId_provider: { shopId, provider } },
      update: { key: encryptedKey },
      create: { shopId, provider, key: encryptedKey },
    });
  });

  await Promise.all(upsertPromises);

  logger.info(`API keys updated for shopId: ${shopId}`);
  res.json({ message: 'Settings updated successfully' });
}));

// Récupérer les statistiques du dashboard
router.get('/dashboard-stats', asyncHandler(async (req, res) => {
  const { shopId } = req.user;
  const { timeframe = '7d' } = req.query;

  // TODO: Implémenter les vraies statistiques avec Prisma
  const stats = {
    averageSeoScore: 72,
    totalProducts: 0,
    optimizedProducts: 0,
    totalCollections: 0,
    optimizedCollections: 0,
    seoScoreTrend: 5,
    optimizedProductsTrend: 3,
    optimizedCollectionsTrend: 2
  };

  res.json(stats);
}));

// Récupérer les statistiques d'utilisation
router.get('/usage-stats', asyncHandler(async (req, res) => {
  const { shopId } = req.user;

  // TODO: Implémenter les vraies statistiques avec Prisma
  const usageStats = {
    optimizationsThisMonth: 15,
    optimizationsLimit: 100,
    optimizedProducts: 45,
    optimizedCollections: 8,
    recentActivity: [
      {
        description: 'Optimisation de 5 produits',
        date: new Date().toISOString()
      }
    ]
  };

  res.json(usageStats);
}));

// Récupérer les informations de facturation
router.get('/billing', asyncHandler(async (req, res) => {
  const { shopId } = req.user;

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { plan: true }
  });

  const billingInfo = {
    plan: shop?.plan || 'free',
    limits: {
      optimizationsPerMonth: shop?.plan === 'premium' ? '∞' : 50,
      products: shop?.plan === 'premium' ? '∞' : 100,
      collections: shop?.plan === 'premium' ? '∞' : 20,
      support: shop?.plan === 'premium' ? 'Prioritaire' : 'Email'
    }
  };

  if (shop?.plan === 'premium') {
    billingInfo.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    billingInfo.amount = 29;
  }

  res.json(billingInfo);
}));

export default router; 