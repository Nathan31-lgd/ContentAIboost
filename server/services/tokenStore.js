import { logger } from '../utils/logger.js';

// Stockage en mémoire (toujours disponible)
const memoryTokens = new Map();

// Prisma optionnel (sera importé si disponible)
let prisma = null;

class TokenStore {
  constructor() {
    // Essayer d'importer Prisma de manière asynchrone
    this.initPrisma();
  }

  async initPrisma() {
    try {
      const prismaModule = await import('../config/prisma.js');
      prisma = prismaModule.default;
      logger.info('✅ Prisma connecté - persistance BDD activée');
    } catch (error) {
      logger.warn('⚠️ Prisma non disponible - mode mémoire uniquement');
    }
  }

  // Stocker un token (mémoire + BDD si disponible)
  async setToken(shopDomain, accessToken) {
    // Toujours stocker en mémoire
    memoryTokens.set(shopDomain, accessToken);
    
    // Essayer de persister en BDD si Prisma est disponible
    if (prisma) {
      try {
        await prisma.shop.upsert({
          where: { shopifyDomain: shopDomain },
          update: { 
            shopifyAccessToken: accessToken,
            updatedAt: new Date()
          },
          create: {
            shopifyDomain: shopDomain,
            shopifyAccessToken: accessToken,
            plan: 'free'
          }
        });
        logger.info(`✅ Token persisté (BDD + mémoire) pour ${shopDomain}`);
      } catch (error) {
        logger.warn(`⚠️ Erreur BDD pour ${shopDomain}, token en mémoire seulement`);
      }
    } else {
      logger.info(`✅ Token stocké en mémoire pour ${shopDomain}`);
    }
    
    return { shopifyDomain: shopDomain };
  }

  // Récupérer un token (BDD en priorité, sinon mémoire)
  async getToken(shopDomain) {
    // D'abord essayer la BDD si disponible
    if (prisma) {
      try {
        const shop = await prisma.shop.findUnique({
          where: { shopifyDomain: shopDomain },
          select: { shopifyAccessToken: true }
        });
        
        if (shop?.shopifyAccessToken) {
          // Synchroniser avec la mémoire
          memoryTokens.set(shopDomain, shop.shopifyAccessToken);
          return shop.shopifyAccessToken;
        }
      } catch (error) {
        logger.warn(`⚠️ Erreur BDD pour ${shopDomain}, fallback mémoire`);
      }
    }
    
    // Fallback mémoire
    return memoryTokens.get(shopDomain) || null;
  }

  // Vérifier si un token existe
  async hasValidToken(shopDomain) {
    const token = await this.getToken(shopDomain);
    return !!token;
  }

  // Supprimer un token
  async removeToken(shopDomain) {
    // Supprimer de la mémoire
    memoryTokens.delete(shopDomain);
    
    // Supprimer de la BDD si disponible
    if (prisma) {
      try {
        await prisma.shop.update({
          where: { shopifyDomain: shopDomain },
          data: { shopifyAccessToken: '' }
        });
      } catch (error) {
        logger.warn(`⚠️ Erreur suppression BDD pour ${shopDomain}`);
      }
    }
    
    return true;
  }

  // Lister les boutiques
  async listShops() {
    const allShops = new Set();
    
    // Ajouter ceux de la mémoire
    memoryTokens.forEach((token, shop) => {
      if (token) allShops.add(shop);
    });
    
    // Ajouter ceux de la BDD si disponible
    if (prisma) {
      try {
        const shops = await prisma.shop.findMany({
          where: { shopifyAccessToken: { not: '' } },
          select: { shopifyDomain: true }
        });
        shops.forEach(shop => allShops.add(shop.shopifyDomain));
      } catch (error) {
        logger.warn('⚠️ Erreur listage BDD');
      }
    }
    
    return Array.from(allShops);
  }
}

export default new TokenStore(); 