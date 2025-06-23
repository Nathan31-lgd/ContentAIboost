import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';

// Store simple en mémoire pour les tokens (pour le développement)
// En production, ceci devrait être dans une base de données
class TokenStore {
  constructor() {
    this.tokens = new Map();
  }

  // Stocker un token d'accès en base de données (PERMANENT)
  async setToken(shopDomain, accessToken) {
    try {
      const shop = await prisma.shop.upsert({
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
      
      logger.info(`✅ Token persisté en BDD pour ${shopDomain}`);
      return shop;
    } catch (error) {
      logger.error(`❌ Erreur lors de la sauvegarde du token pour ${shopDomain}:`, error);
      throw error;
    }
  }

  // Récupérer un token depuis la base de données (PERMANENT)
  async getToken(shopDomain) {
    try {
      const shop = await prisma.shop.findUnique({
        where: { shopifyDomain: shopDomain },
        select: { shopifyAccessToken: true }
      });
      
      if (shop?.shopifyAccessToken) {
        logger.info(`✅ Token récupéré depuis BDD pour ${shopDomain}`);
        return shop.shopifyAccessToken;
      }
      
      logger.warn(`⚠️ Aucun token trouvé en BDD pour ${shopDomain}`);
      return null;
    } catch (error) {
      logger.error(`❌ Erreur lors de la récupération du token pour ${shopDomain}:`, error);
      return null;
    }
  }

  // Vérifier si un token existe et est valide
  async hasValidToken(shopDomain) {
    try {
      const token = await this.getToken(shopDomain);
      return !!token;
    } catch (error) {
      logger.error(`❌ Erreur lors de la vérification du token pour ${shopDomain}:`, error);
      return false;
    }
  }

  // Supprimer un token de la base de données
  async removeToken(shopDomain) {
    try {
      await prisma.shop.update({
        where: { shopifyDomain: shopDomain },
        data: { shopifyAccessToken: '' }
      });
      
      logger.info(`✅ Token supprimé de la BDD pour ${shopDomain}`);
      return true;
    } catch (error) {
      logger.error(`❌ Erreur lors de la suppression du token pour ${shopDomain}:`, error);
      return false;
    }
  }

  // Lister toutes les boutiques avec des tokens valides
  async listShops() {
    try {
      const shops = await prisma.shop.findMany({
        where: {
          shopifyAccessToken: {
            not: ''
          }
        },
        select: { shopifyDomain: true }
      });
      
      const shopDomains = shops.map(shop => shop.shopifyDomain);
      logger.info(`📋 ${shopDomains.length} boutiques avec tokens en BDD:`, shopDomains);
      return shopDomains;
    } catch (error) {
      logger.error('❌ Erreur lors de la récupération des boutiques:', error);
      return [];
    }
  }

  // Méthode utilitaire pour nettoyer les tokens expirés (optionnel)
  async cleanupExpiredTokens() {
    try {
      // Supprimer les shops avec des tokens vides ou très anciens
      const result = await prisma.shop.deleteMany({
        where: {
          OR: [
            { shopifyAccessToken: '' },
            { 
              updatedAt: {
                lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 jours
              }
            }
          ]
        }
      });
      
      logger.info(`🧹 ${result.count} tokens expirés nettoyés de la BDD`);
      return result.count;
    } catch (error) {
      logger.error('❌ Erreur lors du nettoyage des tokens:', error);
      return 0;
    }
  }
}

// Export d'une instance singleton
const tokenStore = new TokenStore();
export default tokenStore; 