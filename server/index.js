import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';
import { initializeShopify, getShopifyAPI } from './config/shopify.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import collectionRoutes from './routes/collections.js';
import optimizationRoutes from './routes/optimizations.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/users.js';

// --- Basic Setup ---
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple Shopify authentication middleware
const shopifyAuthMiddleware = (req, res, next) => {
  // Skip auth for auth routes and health check
  if (req.path.startsWith('/api/auth') || req.path === '/api/health') {
    return next();
  }

  // For API routes, check for Shopify session parameters
  if (req.path.startsWith('/api/')) {
    const { shop } = req.query;
    
    // Only require shop parameter - timestamp and hmac are optional for now
    if (!shop) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Shop parameter required' 
      });
    }

    // Validate shop format
    if (!shop.includes('.myshopify.com')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid shop format' 
      });
    }

    // Create a session for the routes to use
    res.locals.shopify = {
      session: {
        shop,
        accessToken: 'mock-token', // This will be replaced by actual token from DB
      }
    };
  }

  next();
};

// Content Security Policy middleware for Shopify
const shopifyCSPMiddleware = (req, res, next) => {
  const shop = req.query.shop;
  
  if (shop) {
    res.setHeader(
      'Content-Security-Policy',
      `frame-ancestors https://${encodeURIComponent(shop)} https://admin.shopify.com;`
    );
  } else {
    res.setHeader('Content-Security-Policy', "frame-ancestors https://admin.shopify.com https://*.myshopify.com;");
  }
  
  // Remove X-Frame-Options header that might conflict
  res.removeHeader('X-Frame-Options');
  
  next();
};

// --- App Initialization ---
const initializeApp = async () => {
  try {
    logger.info('🚀 Démarrage du serveur...');

    // Initialize Shopify
    initializeShopify();
    const shopify = getShopifyAPI();
    logger.info('✅ Shopify App initialisée');

    // --- Core Middlewares ---
    app.set('trust proxy', 1);
    app.use(shopifyCSPMiddleware); // Set CSP headers first
    app.use(cors({
      origin: [
        'https://admin.shopify.com',
        `https://${process.env.SHOP_CUSTOM_DOMAIN}`,
        process.env.SHOPIFY_APP_URL,
        process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : undefined
      ].filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-shopify-shop-domain'],
    }));
    app.use(compression());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // --- Shopify & API Routes ---
    app.use(shopifyAuthMiddleware); // Simple auth middleware

    // Register API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/collections', collectionRoutes);
    app.use('/api/optimizations', optimizationRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/users', userRoutes);
    
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date() });
    });

    // --- Frontend Serving ---
    const staticPath =
      process.env.NODE_ENV === 'production'
        ? path.join(__dirname, '..', 'client', 'dist')
        : path.join(__dirname, '..', 'client');
    
    app.use(express.static(staticPath, { index: false }));

    app.get('/*', (req, res) => {
      res.sendFile(path.join(staticPath, 'index.html'), (err) => {
        if (err) {
          logger.error('Error sending index.html:', err);
          res.status(500).send(err.message);
        }
      });
    });

    // --- Error Handling ---
    app.use((err, req, res, next) => {
      logger.error('Unhandled error:', { 
        message: err.message, 
        stack: err.stack,
        url: req.originalUrl
      });
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: err.message || 'Internal Server Error',
      });
    });

    // --- Start Server ---
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Serveur démarré sur http://0.0.0.0:${PORT}`);
      logger.info(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      if (process.env.SHOPIFY_APP_URL) {
        logger.info(`🔗 URL de l'app: ${process.env.SHOPIFY_APP_URL}`);
      }
    });

    return app;
  } catch (error) {
    logger.error('❌ Erreur fatale lors de l\'initialisation:', error);
    process.exit(1);
  }
};

// Start the app
initializeApp();

export default app;