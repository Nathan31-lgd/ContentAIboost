console.log('[main.jsx] Starting...');

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import frTranslations from '@shopify/polaris/locales/fr.json';
import App from './App';
import './styles/index.css';

console.log('[main.jsx] Imports loaded successfully');

try {
  const rootElement = document.getElementById('root');
  console.log('[main.jsx] Root element:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const url = new URL(window.location.href);
  const host = url.searchParams.get('host');
  if (!host) {
    throw new Error("Le paramètre 'host' est manquant dans l'URL.");
  }
  
  const appBridgeConfig = {
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY, // Assurez-vous que cette variable est définie dans .env
    host: host,
    forceRedirect: true,
  };

  console.log('[main.jsx] Rendering React app with App Bridge config:', appBridgeConfig);
  
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
  
  console.log('[main.jsx] React app rendered successfully');
  
} catch (error) {
  console.error('[main.jsx] Fatal error:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="color: red;">Erreur de chargement de l'application</h1>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.stack || error.message}</pre>
    </div>
  `;
} 