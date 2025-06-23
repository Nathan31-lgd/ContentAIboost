import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import frTranslations from '@shopify/polaris/locales/fr.json';
import App from './App';
import './styles/index.css';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const url = new URL(window.location.href);
  const host = url.searchParams.get('host');
  if (!host) {
    throw new Error("Le paramètre 'host' est manquant dans l'URL.");
  }
  
  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
  if (!apiKey) {
    throw new Error("La variable d'environnement VITE_SHOPIFY_API_KEY est manquante. Veuillez la définir dans votre fichier .env ou dans les secrets de votre environnement de production.");
  }

  const appBridgeConfig = {
    apiKey: apiKey,
    host: host,
    forceRedirect: true,
  };

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <AppBridgeProvider config={appBridgeConfig}>
          <AppProvider i18n={frTranslations}>
            <App />
          </AppProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );

} catch (error) {
  console.error('[main.jsx] Fatal error:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="color: red;">Erreur de chargement de l'application</h1>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.stack || error.message}</pre>
    </div>
  `;
} 