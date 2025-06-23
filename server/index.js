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
    app.use('/api/auth', authRoutes); // Auth routes are not protected
    app.use('/api/*', shopify.auth.verify()); // All other API routes are protected

    // Register API routes
    app.use('/api/products', productRoutes);
    app.use('/api/collections', collectionRoutes);
    app.use('/api/optimizations', optimizationRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/users', userRoutes);
    
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date() });
    });


    // --- Frontend Serving ---
    app.use(shopify.cspHeaders()); // Set Shopify CSP headers

    const staticPath =
      process.env.NODE_ENV === 'production'
        ? path.join(__dirname, '..', 'client', 'dist')
        : path.join(__dirname, '..', 'client');
    
    app.use(express.static(staticPath, { index: false }));

    app.get('/*', shopify.ensureInstalledOnShop(), (req, res) => {
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