import express from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';
import fetch from 'node-fetch';
import tokenStore from '../services/tokenStore.js';

const router = express.Router();

// Route de redirection après l'authentification Shopify (OAuth)
router.get('/callback', async (req, res) => {
  try {
    const { shop, code, host, timestamp, hmac } = req.query;
    
    if (!shop || !code) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    logger.info(`Callback OAuth pour la boutique: ${shop}`);

    // Vérifier HMAC pour la sécurité
    const queryParams = { ...req.query };
    delete queryParams.hmac;
    const message = new URLSearchParams(queryParams).toString();
    const generatedHmac = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
      .update(message)
      .digest('hex');

    if (generatedHmac !== hmac) {
      logger.error('HMAC invalide pour', shop);
      return res.status(401).json({ error: 'HMAC invalide' });
    }

    // Échanger le code contre un token d'accès
    const accessTokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!accessTokenResponse.ok) {
      throw new Error(`Erreur lors de l'échange du code: ${accessTokenResponse.status}`);
    }

    const { access_token } = await accessTokenResponse.json();

    // Stocker le token en BDD (PERMANENT)
    await tokenStore.setToken(shop, access_token);

    logger.info(`✅ Installation réussie et token persisté en BDD pour: ${shop}`);

    // Rediriger vers l'app dans l'admin Shopify
    const redirectUrl = `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}?shop=${shop}&host=${host}`;
    logger.info(`Redirection vers: ${redirectUrl}`);
    
    res.redirect(redirectUrl);
  } catch (error) {
    logger.error('Erreur lors du callback OAuth:', error);
    res.status(500).json({ error: 'Erreur lors de l\'installation' });
  }
});

// Route pour démarrer le processus d'authentification
router.get('/install', async (req, res) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Paramètre shop manquant' });
    }

    // Nettoyer le nom de la boutique
    const cleanShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const shopDomain = cleanShop.includes('.') ? cleanShop : `${cleanShop}.myshopify.com`;

    // Créer l'URL d'autorisation OAuth
    const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/callback`;
    const installUrl = `https://${shopDomain}/admin/oauth/authorize?` +
      `client_id=${process.env.SHOPIFY_API_KEY}&` +
      `scope=${process.env.SHOPIFY_SCOPES}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}`;

    logger.info(`Installation demandée pour la boutique: ${shopDomain}`);
    logger.info(`URL d'installation: ${installUrl}`);
    
    // Rediriger vers Shopify pour l'autorisation
    res.redirect(installUrl);
  } catch (error) {
    logger.error('Erreur lors de l\'installation:', error);
    res.status(500).json({ error: 'Erreur lors de l\'installation' });
  }
});

// Route pour vérifier le statut d'authentification
router.get('/status', async (req, res) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Paramètre shop manquant' });
    }

    const hasToken = await tokenStore.hasValidToken(shop);
    const allShops = await tokenStore.listShops();
    
    logger.info(`Statut d'authentification pour ${shop}: ${hasToken ? 'OK' : 'KO'}`);
    logger.info(`Boutiques avec token en BDD: ${allShops.join(', ')}`);
    
    res.json({
      authenticated: hasToken,
      shop,
      allShops,
    });
  } catch (error) {
    logger.error('Erreur lors de la vérification du statut:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du statut' });
  }
});

// Route de déconnexion
router.post('/logout', async (req, res) => {
  try {
    const { shop } = req.body;
    
    if (!shop) {
      return res.status(400).json({
        error: 'Paramètre shop manquant'
      });
    }

    await tokenStore.removeToken(shop);
    logger.info(`🔓 Déconnexion réussie et token supprimé de la BDD pour: ${shop}`);
    
    res.json({
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    logger.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      error: 'Erreur lors de la déconnexion'
    });
  }
});

// Route de debug pour vérifier les tokens
router.get('/debug', async (req, res) => {
  try {
    const { shop } = req.query;
    
    const allShops = await tokenStore.listShops();
    const debugInfo = {
      requestedShop: shop,
      allShopsWithTokens: allShops,
      hasTokenForShop: shop ? await tokenStore.hasValidToken(shop) : false,
      timestamp: new Date().toISOString(),
      environment: {
        SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ? '✅ Définie' : '❌ Manquante',
        SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET ? '✅ Définie' : '❌ Manquante',
        SHOPIFY_SCOPES: process.env.SHOPIFY_SCOPES || 'Non définie',
        SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL || 'Non définie',
        DATABASE_URL: process.env.DATABASE_URL ? '✅ Connectée' : '❌ Manquante',
      }
    };
    
    logger.info('Debug auth info:', debugInfo);
    res.json(debugInfo);
  } catch (error) {
    logger.error('Erreur debug auth:', error);
    res.status(500).json({ error: 'Erreur debug' });
  }
});

export default router; 