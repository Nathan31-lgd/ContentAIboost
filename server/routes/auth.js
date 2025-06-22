import express from 'express';
import jwt from 'jsonwebtoken';
import shopify from '../config/shopify.js';
import prisma from '../config/prisma.js';
import { encrypt } from '../utils/encryption.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';
import fetch from 'node-fetch';

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

    const { access_token } = await accessTokenResponse.json();

    // Sauvegarder le shop et le token dans la base de données
    await prisma.shop.upsert({
      where: { shopifyDomain: shop },
      update: { 
        shopifyAccessToken: access_token,
      },
      create: {
        shopifyDomain: shop,
        shopifyAccessToken: access_token,
      },
    });

    logger.info(`Installation réussie pour la boutique: ${shop}`);

    // Rediriger vers l'app dans l'admin Shopify
    const appUrl = `https://${shop}/admin/apps/${process.env.SHOPIFY_APP_NAME.toLowerCase()}`;
    res.redirect(appUrl);
  } catch (error) {
    logger.error('Erreur lors du callback OAuth:', error);
    res.status(500).json({ error: 'Erreur lors de l\'installation' });
  }
});

// Route pour démarrer le processus d'authentification
router.get('/', (req, res) => {
  const { shop } = req.query;
  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }
  
  // La redirection est gérée par le middleware shopifyAuth
  res.send('Redirecting to Shopify for authentication...');
});

// Route pour vérifier la validité d'un token JWT
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ valid: false, message: 'Invalid token' });
    }

    const shop = await prisma.shop.findUnique({
      where: { shopifyDomain: decoded.shop },
      select: { shopifyDomain: true, email: true, plan: true }
    });

    if (!shop) {
      return res.status(401).json({ valid: false, message: 'Shop not found' });
    }
    
    res.json({ valid: true, user: shop });
  });
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

    logger.info(`🔓 Déconnexion réussie pour: ${shop}`);
    
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

// Route d'installation de l'app
router.get('/install', async (req, res) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Paramètre shop manquant' });
    }

    // Créer l'URL d'autorisation OAuth
    const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/callback`;
    const installUrl = `https://${shop}/admin/oauth/authorize?` +
      `client_id=${process.env.SHOPIFY_API_KEY}&` +
      `scope=${process.env.SHOPIFY_SCOPES}&` +
      `redirect_uri=${redirectUri}`;

    logger.info(`Installation demandée pour la boutique: ${shop}`);
    
    // Rediriger vers Shopify pour l'autorisation
    res.redirect(installUrl);
  } catch (error) {
    logger.error('Erreur lors de l\'installation:', error);
    res.status(500).json({ error: 'Erreur lors de l\'installation' });
  }
});

export default router; 