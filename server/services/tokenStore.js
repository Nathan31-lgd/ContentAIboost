import { logger } from '../utils/logger.js';

// Store simple en mémoire pour les tokens (pour le développement)
// En production, ceci devrait être dans une base de données
class TokenStore {
  constructor() {
    this.tokens = new Map();
  }

  // Stocker un token pour une boutique
  setToken(shop, accessToken) {
    this.tokens.set(shop, {
      accessToken,
      timestamp: Date.now(),
    });
    logger.info(`Token stocké pour ${shop}`);
  }

  // Récupérer un token pour une boutique
  getToken(shop) {
    const tokenData = this.tokens.get(shop);
    if (!tokenData) {
      logger.warn(`Aucun token trouvé pour ${shop}`);
      return null;
    }

    // Vérifier si le token n'est pas trop ancien (24h)
    const ageInHours = (Date.now() - tokenData.timestamp) / (1000 * 60 * 60);
    if (ageInHours > 24) {
      logger.warn(`Token expiré pour ${shop} (${ageInHours.toFixed(1)}h)`);
      this.tokens.delete(shop);
      return null;
    }

    return tokenData.accessToken;
  }

  // Supprimer un token
  removeToken(shop) {
    const deleted = this.tokens.delete(shop);
    if (deleted) {
      logger.info(`Token supprimé pour ${shop}`);
    }
    return deleted;
  }

  // Lister toutes les boutiques avec token
  listShops() {
    return Array.from(this.tokens.keys());
  }

  // Vérifier si une boutique a un token valide
  hasValidToken(shop) {
    return this.getToken(shop) !== null;
  }
}

export default new TokenStore(); 