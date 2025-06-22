import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';

// --- Middlewares & Routes ---
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { shopifyAuth } from './middleware/shopifyAuth.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import collectionRoutes from './routes/collections.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/users.js';
import optimizationRoutes from './routes/optimizations.js';
import { initializeShopify } from './config/shopify.js';

// --- Configuration ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Initialisation des services ---
initializeShopify();
logger.info('Shopify services initialisés');

// --- Middlewares généraux ---
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'frame-ancestors': ["'self'", `https://admin.shopify.com`, `https://*.myshopify.com`],
      'img-src': ["'self'", "data:", "https:"],
    },
  },
}));

// --- Logging des requêtes ---
app.use((req, res, next) => {
  logger.info(`[REQ] ${req.method} ${req.path}`);
  next();
});

// --- Routes publiques (Authentification, Health Check) ---
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// --- Routes API sécurisées ---
// Toutes les routes suivantes requièrent une session Shopify valide
const apiRouter = express.Router();
apiRouter.use(shopifyAuth);
apiRouter.use(authMiddleware);

apiRouter.use('/products', productRoutes);
apiRouter.use('/collections', collectionRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/optimizations', optimizationRoutes);

app.use('/api', apiRouter);

// --- Service de l'application frontend (React) ---
const clientDistPath = path.resolve(__dirname, '../dist/client');
app.use(express.static(clientDistPath));

// Pour toute requête non API, servir l'application React.
// Ceci doit être protégé par le middleware d'authentification de Shopify.
app.get('/*', shopifyAuth, (req, res) => {
  logger.info(`[FRONTEND] Service de l'application React pour la boutique ${req.query.shop}`);
  res.sendFile(path.resolve(clientDistPath, 'index.html'), (err) => {
    if (err) {
      logger.error(`[FRONTEND-ERROR] Impossible de servir index.html: ${err.message}`);
      res.status(500).send("Une erreur est survenue lors du chargement de l'application.");
    }
  });
});

// --- Gestion des erreurs globale ---
app.use(errorHandler);

// --- Démarrage du serveur ---
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Serveur ContentAIBoost démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`);
});

export default app; 