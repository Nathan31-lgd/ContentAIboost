import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration de base
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__dirname);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Démarrage du serveur ContentAIBoost...');
console.log('📊 NODE_ENV:', process.env.NODE_ENV);
console.log('🔗 PORT:', PORT);

// Configuration pour les proxies
app.set('trust proxy', true);

// Middlewares de base
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
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Route de santé (priorité absolue)
app.get('/api/health', (req, res) => {
  console.log('✅ Route /api/health appelée');
  try {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      shopify_configured: !!(process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET),
      database_configured: !!process.env.DATABASE_URL
    };
    console.log('✅ Health check réussi:', healthData);
    res.json(healthData);
  } catch (error) {
    console.error('❌ Erreur health check:', error);
    res.status(500).json({ error: 'Health check failed', details: error.message });
  }
});

// Routes d'authentification Shopify
app.get('/api/auth/shopify', (req, res) => {
  console.log('🔐 Route auth Shopify appelée');
  const { shop } = req.query;
  
  if (!shop) {
    return res.status(400).json({ error: 'Paramètre shop manquant' });
  }
  
  console.log('🏪 Boutique:', shop);
  
  // URL d'autorisation Shopify
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products';
  const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/shopify/callback`;
  const state = Math.random().toString(36).substring(7);
  
  const authUrl = `https://${shop}/admin/oauth/authorize?` + 
    `client_id=${process.env.SHOPIFY_API_KEY}&` +
    `scope=${scopes}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${state}`;
  
  console.log('🔗 Redirection vers:', authUrl);
  res.redirect(authUrl);
});

// Callback d'authentification Shopify
app.get('/api/auth/shopify/callback', async (req, res) => {
  console.log('🔄 Callback Shopify reçu');
  const { code, shop, state } = req.query;
  
  if (!code || !shop) {
    console.error('❌ Code ou shop manquant');
    return res.status(400).json({ error: 'Code ou shop manquant' });
  }
  
  try {
    console.log('🔑 Échange du code contre un token...');
    
    // Échange du code contre un access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code: code
      })
    });
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Token reçu pour la boutique:', shop);
    
    if (tokenData.access_token) {
      // Rediriger vers l'app installée
      const appUrl = `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}`;
      console.log('🎉 Installation réussie, redirection vers:', appUrl);
      
      // Page de succès avec redirection automatique
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Installation réussie - ContentAIBoost</title>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                text-align: center; 
                padding: 50px; 
                background: #f8fafc;
                color: #334155;
              }
              .container {
                max-width: 500px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              .success { 
                background: #dcfce7; 
                color: #166534; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
              }
              .loading {
                margin: 20px 0;
              }
              .spinner {
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3498db;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: spin 1s linear infinite;
                margin: 0 auto;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
            <script>
              setTimeout(() => {
                window.top.location.href = '${appUrl}';
              }, 3000);
            </script>
          </head>
          <body>
            <div class="container">
              <h1>🎉 Installation réussie !</h1>
              <div class="success">
                ContentAIBoost a été installé avec succès dans votre boutique Shopify
              </div>
              <div class="loading">
                <div class="spinner"></div>
                <p>Redirection vers votre dashboard Shopify...</p>
              </div>
              <p><small>Si la redirection ne fonctionne pas, <a href="${appUrl}">cliquez ici</a></small></p>
            </div>
          </body>
        </html>
      `);
    } else {
      throw new Error('Token non reçu');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'authentification:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'authentification',
      details: error.message 
    });
  }
});

// Route racine pour l'app Shopify
app.get('/', (req, res) => {
  console.log('✅ Route / appelée');
  try {
    const { shop, hmac, host } = req.query;
    console.log('📋 Paramètres reçus:', { shop, hmac: !!hmac, host });
    
    // Si on a les paramètres Shopify, c'est une installation/accès
    if (shop && hmac) {
      console.log('🏪 Accès depuis Shopify détecté');
      
      // Servir l'app React complète
      if (process.env.NODE_ENV === 'production') {
        try {
          res.sendFile(path.join(__dirname, 'dist/client/index.html'));
          return;
        } catch (error) {
          console.error('❌ Erreur fichier React:', error);
        }
      }
      
      // Fallback : page simple pour l'app
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ContentAIBoost</title>
            <meta charset="utf-8">
            <script src="https://unpkg.com/@shopify/app-bridge@3"></script>
            <script>
              const AppBridge = window['app-bridge'];
              const app = AppBridge.createApp({
                apiKey: '${process.env.SHOPIFY_API_KEY}',
                host: '${host}',
                forceRedirect: true
              });
            </script>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                text-align: center; 
                padding: 50px; 
                background: #f8fafc;
              }
              .app-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
            </style>
          </head>
          <body>
            <div class="app-container">
              <h1>🚀 ContentAIBoost</h1>
              <p>Application d'optimisation SEO avec IA</p>
              <p>Boutique: <strong>${shop}</strong></p>
              <p>Chargement de l'interface...</p>
            </div>
          </body>
        </html>
      `);
    } else {
      // Page d'accueil publique
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>ContentAIBoost</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                text-align: center; 
                padding: 50px; 
                background: #f8fafc;
                color: #334155;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              h1 { color: #1e293b; margin-bottom: 20px; }
              .status { 
                background: #dcfce7; 
                color: #166534; 
                padding: 12px; 
                border-radius: 8px; 
                margin: 20px 0; 
              }
              .info { 
                background: #f1f5f9; 
                padding: 15px; 
                border-radius: 8px; 
                margin: 10px 0; 
                text-align: left; 
              }
              .install-btn {
                background: #3b82f6;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚀 ContentAIBoost</h1>
              <div class="status">✅ Serveur opérationnel</div>
              <p>Application Shopify pour l'optimisation SEO avec IA</p>
              
              <div class="info">
                <strong>Informations système :</strong><br>
                • Mode: ${process.env.NODE_ENV || 'development'}<br>
                • Port: ${PORT}<br>
                • Timestamp: ${new Date().toISOString()}<br>
                • Shopify configuré: ${!!(process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET) ? '✅' : '❌'}<br>
                • Base de données: ${!!process.env.DATABASE_URL ? '✅' : '❌'}
              </div>
              
              <a href="/api/auth/shopify?shop=contentboostai.myshopify.com" class="install-btn">
                📱 Installer dans Shopify
              </a>
              
              <p><small>Pour installer dans une autre boutique, remplacez "contentboostai" par votre nom de boutique</small></p>
            </div>
          </body>
        </html>
      `;
      
      res.send(html);
      console.log('✅ Page d\'accueil servie avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur route /:', error);
    res.status(500).send(`<h1>Erreur serveur</h1><p>${error.message}</p>`);
  }
});

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  try {
    const staticPath = path.join(__dirname, 'dist/client');
    console.log('📁 Chemin fichiers statiques:', staticPath);
    app.use(express.static(staticPath));
    console.log('✅ Fichiers statiques configurés');
  } catch (error) {
    console.error('❌ Erreur fichiers statiques:', error);
  }
}

// Route catch-all pour debug
app.use('*', (req, res) => {
  console.log(`❓ Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route non trouvée',
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Gestion d'erreurs globale
app.use((err, req, res, next) => {
  console.error('💥 Erreur globale:', err);
  res.status(500).json({
    error: 'Erreur serveur interne',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Démarrage du serveur
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur ContentAIBoost démarré avec succès`);
  console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🌐 URL publique: ${process.env.SHOPIFY_APP_URL || 'Non configurée'}`);
  console.log(`🔑 Shopify API Key: ${process.env.SHOPIFY_API_KEY ? 'Configurée' : 'Manquante'}`);
  console.log(`🗄️ Base de données: ${process.env.DATABASE_URL ? 'Configurée' : 'Manquante'}`);
});

// Gestion des erreurs de serveur
server.on('error', (error) => {
  console.error('💥 Erreur serveur:', error);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  // Ne pas quitter en production pour debug
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

export default app; 