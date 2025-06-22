import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

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
app.use(cors());
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.shopify.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.shopify.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.shopify.com"],
      frameAncestors: ["'self'", "https://admin.shopify.com", "https://*.myshopify.com"]
    }
  }
}));

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
const clientPath = path.join(__dirname, '../dist/client');
app.use(express.static(clientPath));

// Route principale - Servir l'app React ou une page d'installation
app.get('*', (req, res) => {
  const { shop, hmac } = req.query;
  
  // Si on a les paramètres Shopify, servir l'app React
  if (shop && hmac && verifyShopifyHmac(req.query)) {
    const indexPath = path.join(clientPath, 'index.html');
    
    // Vérifier si le fichier existe
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('[SERVE ERROR]', err);
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
    // Page d'accueil / installation
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ContentAIBoost - Installation</title>
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
          .install-btn {
            display: inline-block;
            background: #008060;
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 18px;
            font-weight: 600;
          }
          .install-btn:hover { background: #006b4f; }
          .status {
            background: #e3f2e1;
            color: #108043;
            padding: 8px 16px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="status">✓ Serveur actif</div>
          <h1>ContentAIBoost</h1>
          <p>Application d'optimisation SEO avec Intelligence Artificielle pour Shopify</p>
          
          ${shop ? `
            <p style="color: #202223; font-weight: 600;">Boutique détectée : ${shop}</p>
            <a href="/api/auth/shopify?shop=${shop}" class="install-btn">
              Installer l'application
            </a>
          ` : `
            <p>Pour installer l'application, utilisez cette URL avec votre boutique :</p>
            <code style="background: #f6f6f7; padding: 10px; display: block; margin: 20px 0;">
              ${process.env.SHOPIFY_APP_URL}/?shop=VOTRE-BOUTIQUE.myshopify.com
            </code>
          `}
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

// --- Démarrage du serveur ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ContentAIBoost démarré sur le port ${PORT}`);
  console.log(`📊 Mode: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: ${process.env.SHOPIFY_APP_URL}`);
});

export default app; 