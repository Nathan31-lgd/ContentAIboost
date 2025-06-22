import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import des routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import collectionRoutes from './routes/collections.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/users.js';
import optimizationRoutes from './routes/optimizations.js';

// Import des middlewares
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { shopifyAuth } from './middleware/shopifyAuth.js';

// Import des services
import { initializeShopify } from './config/shopify.js';
import { logger } from './utils/logger.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration pour les proxies (nécessaire pour localtunnel)
app.set('trust proxy', true);

// Initialisation des services
initializeShopify();

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://cdn.shopify.com"],
      connectSrc: ["'self'", "https://api.shopify.com", "https://api.openai.com", "https://api.anthropic.com", "https://generativelanguage.googleapis.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite par IP
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  }
});
app.use('/api/', limiter);

// Middlewares de base
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.SHOPIFY_APP_URL] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging des requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', shopifyAuth, authMiddleware, productRoutes);
app.use('/api/collections', shopifyAuth, authMiddleware, collectionRoutes);
app.use('/api/ai', shopifyAuth, authMiddleware, aiRoutes);
app.use('/api/users', shopifyAuth, authMiddleware, userRoutes);
app.use('/api/optimizations', shopifyAuth, authMiddleware, optimizationRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Route racine pour l'app Shopify
app.get('/', (req, res) => {
  const { shop, hmac, host } = req.query;
  
  if (shop && hmac) {
    // Si on a les paramètres Shopify, servir l'app
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(__dirname, '../dist/client/index.html'));
    } else {
      // En développement, rediriger vers Vite
      res.redirect(`http://localhost:5173?shop=${shop}&host=${host}`);
    }
  } else {
    // Sinon, afficher une page d'accueil
    res.send(`
      <html>
        <head>
          <title>ContentAIBoost</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <h1>ContentAIBoost</h1>
          <p>Application Shopify pour l'optimisation SEO</p>
          <p>Installez cette app depuis votre admin Shopify</p>
        </body>
      </html>
    `);
  }
});

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist/client')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/client/index.html'));
  });
}

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl 
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  logger.info(`🚀 Serveur ContentAIBoost démarré sur le port ${PORT}`);
  logger.info(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 URL: http://localhost:${PORT}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app; 