import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import des routes (avec gestion d'erreur)
let authRoutes, productRoutes, collectionRoutes, aiRoutes, userRoutes, optimizationRoutes;
let shopifyAuth, authMiddleware, errorHandler, initializeShopify, logger;

try {
  // Import conditionnel des modules
  const authModule = await import('./routes/auth.js');
  authRoutes = authModule.default;
  
  const shopifyAuthModule = await import('./middleware/shopifyAuth.js');
  shopifyAuth = shopifyAuthModule.shopifyAuth;
  
  const authMiddlewareModule = await import('./middleware/auth.js');
  authMiddleware = authMiddlewareModule.authMiddleware;
  
  const errorHandlerModule = await import('./middleware/errorHandler.js');
  errorHandler = errorHandlerModule.errorHandler;
  
  const shopifyModule = await import('./config/shopify.js');
  initializeShopify = shopifyModule.initializeShopify;
  
  const loggerModule = await import('./utils/logger.js');
  logger = loggerModule.logger;
  
  console.log('✅ Tous les modules importés avec succès');
} catch (error) {
  console.error('❌ Erreur import modules:', error.message);
  // Créer des fallbacks
  logger = {
    info: console.log,
    error: console.error
  };
  errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  };
}

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration pour les proxies (nécessaire pour localtunnel)
app.set('trust proxy', true);

// Initialisation des services (avec gestion d'erreur)
try {
  if (initializeShopify) {
    initializeShopify();
    console.log('✅ Shopify initialisé');
  }
} catch (error) {
  console.error('❌ Erreur Shopify:', error.message);
}

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
  console.log(`${req.method} ${req.path}`);
  if (logger) {
    logger.info(`${req.method} ${req.path}`);
  }
  next();
});

// Routes API (avec gestion d'erreur)
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('✅ Routes auth chargées');
}

// Route de santé (TOUJOURS disponible)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route racine pour l'app Shopify
app.get('/', (req, res) => {
  const { shop, hmac, host } = req.query;
  
  // En production, toujours servir l'app React
  if (process.env.NODE_ENV === 'production') {
    try {
      res.sendFile(path.join(__dirname, '../dist/client/index.html'));
    } catch (error) {
      console.error('❌ Erreur fichier HTML:', error.message);
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
            <p><small>Mode: ${process.env.NODE_ENV || 'development'}</small></p>
          </body>
        </html>
      `);
    }
  } else {
    // En développement
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
          <p><small>Mode: ${process.env.NODE_ENV || 'development'}</small></p>
        </body>
      </html>
    `);
  }
});

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  try {
    app.use(express.static(path.join(__dirname, '../dist/client')));
    console.log('✅ Fichiers statiques configurés');
  } catch (error) {
    console.error('❌ Erreur fichiers statiques:', error.message);
  }
}

// Middleware de gestion d'erreurs
if (errorHandler) {
  app.use(errorHandler);
}

// Route catch-all
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl 
  });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur ContentAIBoost démarré sur le port ${PORT}`);
  console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  if (logger) {
    logger.info(`🚀 Serveur ContentAIBoost démarré sur le port ${PORT}`);
  }
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Ne pas quitter en production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

export default app; 