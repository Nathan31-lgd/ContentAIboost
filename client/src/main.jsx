console.log('[main.jsx] Starting...');

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
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
  
  console.log('[main.jsx] Rendering React app...');
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppProvider i18n={frTranslations}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProvider>
    </React.StrictMode>
  );
  
  console.log('[main.jsx] React app rendered successfully');
  
} catch (error) {
  console.error('[main.jsx] Fatal error:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="color: red;">Erreur de chargement</h1>
      <p>Une erreur s'est produite lors du chargement de l'application.</p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.stack || error.message}</pre>
      <p>Vérifiez la console pour plus de détails.</p>
    </div>
  `;
} 