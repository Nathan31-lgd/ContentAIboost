import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { ShopifyProvider } from './contexts/ShopifyContext';
import frTranslations from '@shopify/polaris/locales/fr.json';
import App from './App';
import './styles/index.css';
import '@shopify/polaris/build/esm/styles.css';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const url = new URL(window.location.href);
  const host = url.searchParams.get('host');
  const shop = url.searchParams.get('shop');
  
  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
  if (!apiKey) {
    console.warn("VITE_SHOPIFY_API_KEY est manquante. Certaines fonctionnalités peuvent ne pas fonctionner.");
  }

  // Configuration App Bridge - plus flexible
  let appBridgeConfig = null;
  if (apiKey && host) {
    appBridgeConfig = {
      apiKey: apiKey,
      host: host,
      forceRedirect: true,
    };
  }

  // Fonction pour rendre l'application
  const renderApp = () => (
    <React.StrictMode>
      <BrowserRouter>
        {appBridgeConfig ? (
          <AppBridgeProvider config={appBridgeConfig}>
            <ShopifyProvider>
              <AppProvider i18n={frTranslations}>
                <App />
              </AppProvider>
            </ShopifyProvider>
          </AppBridgeProvider>
        ) : (
          <AppProvider i18n={frTranslations}>
            <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
              <h1>ContentAIBoost</h1>
              <p>Application d'optimisation SEO pour Shopify</p>
              {!host && !shop && (
                <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                  <h3>Pour accéder à l'application :</h3>
                  <p>Veuillez accéder à cette URL depuis votre interface d'administration Shopify.</p>
                  <p>Ou ajoutez les paramètres requis : <code>?shop=votre-boutique.myshopify.com</code></p>
                </div>
              )}
            </div>
          </AppProvider>
        )}
      </BrowserRouter>
    </React.StrictMode>
  );

  ReactDOM.createRoot(rootElement).render(renderApp());

} catch (error) {
  console.error('[main.jsx] Fatal error:', error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1 style="color: red;">Erreur de chargement de l'application</h1>
        <p>Une erreur s'est produite lors du chargement de ContentAIBoost.</p>
        <details style="margin-top: 10px;">
          <summary>Détails de l'erreur</summary>
          <pre style="background: #f5f5f5; padding: 10px; overflow: auto; margin-top: 10px;">${error.stack || error.message}</pre>
        </details>
        <p style="margin-top: 20px;">
          <a href="${window.location.origin}" style="color: #008060;">Recharger l'application</a>
        </p>
      </div>
    `;
  }
} 