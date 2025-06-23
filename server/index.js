import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { logger } from './utils/logger.js';

// --- Configuration ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialisation simplifiée pour le moment
console.log('🚀 Initialisation du serveur ContentAIBoost');

// --- Middlewares généraux ---
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: [
    'https://admin.shopify.com',
    'https://*.myshopify.com',
    'https://contentboostai.myshopify.com',
    process.env.SHOPIFY_APP_URL,
    process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : false
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-shopify-shop-domain'],
}));
app.use(compression());
app.use((req, res, next) => {
  const shop = req.query.shop;
  if (shop) {
    res.setHeader(
      'Content-Security-Policy',
      `frame-ancestors https://${encodeURIComponent(
        shop
      )} https://admin.shopify.com;`
    );
  } else {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none';");
  }
  next();
});
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Logging des requêtes ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    shopify_configured: !!(process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET)
  });
});

// --- Fonction pour vérifier la signature HMAC de Shopify ---
function verifyShopifyHmac(query) {
  const { hmac, ...params } = query;
  if (!hmac) return false;
  
  const message = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
    
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(message, 'utf8')
    .digest('hex');
    
  return hash === hmac;
}

// --- Route d'installation Shopify ---
app.get('/api/auth/shopify', (req, res) => {
  const { shop } = req.query;
  
  if (!shop || !shop.match(/[a-zA-Z0-9-]+\.myshopify\.com/)) {
    return res.status(400).json({ error: 'Paramètre shop invalide' });
  }
  
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_themes,write_themes';
  const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/shopify/callback`;
  const state = crypto.randomBytes(16).toString('hex');
  
  // Stocker le state en session (simplifié pour le moment)
  const authUrl = `https://${shop}/admin/oauth/authorize?` + 
    `client_id=${process.env.SHOPIFY_API_KEY}&` +
    `scope=${scopes}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${state}`;
  
  console.log(`[AUTH] Redirection vers Shopify pour ${shop}`);
  res.redirect(authUrl);
});

// --- Callback OAuth Shopify ---
app.get('/api/auth/shopify/callback', async (req, res) => {
  const { code, shop, state, hmac } = req.query;
  
  if (!code || !shop) {
    return res.status(400).send('Paramètres manquants');
  }
  
  try {
    // Échanger le code contre un token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.access_token) {
      console.log(`[AUTH] Installation réussie pour ${shop}`);
      
      // Rediriger vers l'app dans Shopify admin
      const appUrl = `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}`;
      res.redirect(appUrl);
    } else {
      throw new Error('Token non reçu');
    }
  } catch (error) {
    console.error('[AUTH ERROR]', error);
    res.status(500).send('Erreur lors de l\'authentification');
  }
});

// --- Middleware simple pour vérifier l'authentification Shopify ---
const shopifyAuthCheck = (req, res, next) => {
  const { shop, hmac } = req.query;
  
  // Si c'est une route d'API, vérifier l'authentification
  if (req.path.startsWith('/api/') && !req.path.startsWith('/api/auth/')) {
    if (!shop || !hmac) {
      return res.status(401).json({ 
        error: 'Accès non autorisé',
        message: 'Authentification Shopify requise'
      });
    }
    
    if (!verifyShopifyHmac(req.query)) {
      return res.status(401).json({ 
        error: 'Signature invalide',
        message: 'La signature HMAC est invalide'
      });
    }
  }
  
  next();
};

app.use(shopifyAuthCheck);

// Routes API (simplifiées pour le moment)
app.get('/api/products', (req, res) => {
  res.json({ products: [], message: 'Route products fonctionnelle' });
});

app.get('/api/collections', (req, res) => {
  res.json({ collections: [], message: 'Route collections fonctionnelle' });
});

// Servir les fichiers statiques
// Sur Render, le working directory est à la racine du projet
const clientPath = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'dist/client')
  : path.join(__dirname, '../dist/client');

console.log(`[STATIC FILES] Serving from: ${clientPath}`);
console.log(`[STATIC FILES] Current directory: ${process.cwd()}`);
console.log(`[STATIC FILES] __dirname: ${__dirname}`);

app.use(express.static(clientPath));

// Toutes les routes non-API doivent servir l'app React
app.get('*', (req, res) => {
  const { shop, hmac } = req.query;
  
  // Si on a un shop mais pas de HMAC, c'est une tentative d'installation
  // On redirige DIRECTEMENT vers l'OAuth sans afficher de page
  if (shop && shop.includes('.myshopify.com') && !hmac) {
    console.log(`[AUTO-INSTALL] Redirection automatique vers OAuth pour ${shop}`);
    return res.redirect(`/api/auth/shopify?shop=${shop}`);
  }
  
  // Si on a les paramètres Shopify complets, servir l'app
  if (shop && hmac && verifyShopifyHmac(req.query)) {
    const indexPath = path.join(clientPath, 'index.html');
    
    console.log(`[SERVE] Attempting to serve React app from: ${indexPath}`);
    console.log(`[SERVE] File exists check...`);
    
    // Vérifier si le fichier existe
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('[SERVE ERROR]', err);
        console.error('[SERVE ERROR] Full path:', indexPath);
        // Fallback : servir une interface temporaire
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>ContentAIBoost</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script src="https://unpkg.com/@shopify/app-bridge@3"></script>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                padding: 40px;
                max-width: 1200px;
                margin: 0 auto;
                background: #f6f6f7;
              }
              .card {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
              }
              h1 { color: #202223; }
              .status { 
                display: inline-block;
                padding: 8px 16px;
                background: #e3f2e1;
                color: #108043;
                border-radius: 4px;
                font-weight: 600;
              }
              .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 30px;
              }
              .metric {
                padding: 20px;
                background: #f9fafb;
                border-radius: 6px;
              }
              .metric h3 {
                margin: 0 0 10px 0;
                color: #6d7175;
                font-size: 14px;
                font-weight: 500;
              }
              .metric p {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                color: #202223;
              }
              button {
                background: #008060;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 4px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px 5px;
              }
              button:hover { background: #006b4f; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>🚀 ContentAIBoost</h1>
              <p class="status">✓ Application active</p>
              <p style="margin-top: 20px; color: #6d7175;">
                Optimisation SEO avec Intelligence Artificielle pour ${shop}
              </p>
            </div>
            
            <div class="grid">
              <div class="card">
                <h2>📊 Tableau de bord</h2>
                <div class="metric">
                  <h3>Produits optimisés</h3>
                  <p>0 / 0</p>
                </div>
                <div class="metric" style="margin-top: 15px;">
                  <h3>Score SEO moyen</h3>
                  <p>--</p>
                </div>
                <button onclick="alert('Fonctionnalité en cours de développement')">
                  Analyser les produits
                </button>
              </div>
              
              <div class="card">
                <h2>🤖 Configuration IA</h2>
                <p style="color: #6d7175; margin-bottom: 20px;">
                  Configurez vos clés API pour activer l'optimisation automatique
                </p>
                <button onclick="alert('Fonctionnalité en cours de développement')">
                  Configurer OpenAI
                </button>
                <button onclick="alert('Fonctionnalité en cours de développement')">
                  Configurer Claude
                </button>
              </div>
              
              <div class="card">
                <h2>🚀 Actions rapides</h2>
                <button onclick="alert('Fonctionnalité en cours de développement')">
                  Optimiser un produit
                </button>
                <button onclick="alert('Fonctionnalité en cours de développement')">
                  Optimisation en lot
                </button>
                <button onclick="alert('Fonctionnalité en cours de développement')">
                  Voir les paramètres
                </button>
              </div>
            </div>
            
            <script>
              // Initialiser App Bridge
              const AppBridge = window['app-bridge'];
              const app = AppBridge.createApp({
                apiKey: '${process.env.SHOPIFY_API_KEY}',
                shopOrigin: '${shop}',
                forceRedirect: true
              });
            </script>
          </body>
          </html>
        `);
      }
    });
  } else {
    // Page d'accueil simple
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ContentAIBoost</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #f6f6f7;
          }
          .container {
            background: white;
            padding: 60px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
          }
          h1 { color: #202223; margin-bottom: 10px; }
          p { color: #6d7175; margin-bottom: 30px; }
          .url-box {
            background: #f6f6f7;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>ContentAIBoost</h1>
          <p>Application d'optimisation SEO pour Shopify</p>
          
          <p><strong>Pour installer :</strong></p>
          <p>Ajoutez <code>?shop=VOTRE-BOUTIQUE.myshopify.com</code> à l'URL</p>
          
          <div class="url-box">
            ${process.env.SHOPIFY_APP_URL}/?shop=contentboostai.myshopify.com
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ 
    error: 'Erreur serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// --- Initialisation ---
const initializeApp = async () => {
  try {
    logger.info('🚀 Démarrage du serveur...');

    // Initialiser Shopify si les variables d'environnement sont définies
    if (process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET) {
      try {
        initializeShopify();
        
        // Initialiser le service Shopify
        const shopifyService = await import('./services/shopifyService.js');
        await shopifyService.default.initialize();
        
        logger.info('✅ Shopify API et service initialisés');
      } catch (shopifyError) {
        logger.error('⚠️ Erreur Shopify (non critique):', shopifyError.message);
      }
    } else {
      logger.warn('⚠️ Variables Shopify manquantes - fonctionnalités Shopify désactivées');
    }

    // --- Démarrage du serveur ---
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Serveur démarré sur http://0.0.0.0:${PORT}`);
      logger.info(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      if (process.env.SHOPIFY_APP_URL) {
        logger.info(`🔗 URL de l'app: ${process.env.SHOPIFY_APP_URL}`);
      }
    });

    return app;
  } catch (error) {
    console.error('[INIT ERROR]', error);
    process.exit(1);
  }
};

// Démarrer l'application
initializeApp();

export default app; 