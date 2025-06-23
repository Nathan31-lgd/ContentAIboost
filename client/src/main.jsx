console.log('[main.jsx] Starting...');

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { createApp } from '@shopify/app-bridge';
import App from './App';
import './styles/index.css';

console.log('[main.jsx] Imports loaded successfully');

try {
  // Configuration App Bridge
  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get('host');
  const shop = urlParams.get('shop');
  
  console.log('[main.jsx] Shopify params:', { host, shop, allParams: Object.fromEntries(urlParams) });
  
  const config = {
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY || 'e64a4504c28e6dfa3bd96ecb7c6e55a8',
    host: host || '',
    forceRedirect: true
  };
  
  console.log('[main.jsx] Creating Shopify app with config:', config);
  const app = createApp(config);

  // Configuration React Query
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });

  // Configuration Polaris
  const polarisConfig = {
    i18n: {
      Polaris: {
        ResourceList: {
          sortingLabel: 'Trier par',
          defaultItemSingular: 'élément',
          defaultItemPlural: 'éléments',
          showLabel: 'Afficher',
          selectButtonText: 'Sélectionner',
          selectAllButtonText: 'Tout sélectionner',
          emptyStateTitle: 'Aucun élément trouvé',
          emptyStateDescription: 'Essayez de modifier vos filtres ou de créer un nouvel élément.',
        },
        DataTable: {
          sortableLabel: 'Trier par',
        },
        Pagination: {
          previous: 'Précédent',
          next: 'Suivant',
          of: 'sur',
        },
        Modal: {
          close: 'Fermer',
        },
        Button: {
          primaryAction: 'Confirmer',
          secondaryAction: 'Annuler',
        },
        FormLayout: {
          title: 'Formulaire',
        },
        Card: {
          title: 'Carte',
        },
        Banner: {
          title: 'Bannière',
          dismissButton: {
            accessibilityLabel: 'Fermer',
          },
        },
        Toast: {
          dismissButton: {
            accessibilityLabel: 'Fermer',
          },
        },
      },
    },
  };

  console.log('[main.jsx] Rendering React app...');
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <AppBridgeProvider app={app}>
        <AppProvider config={polarisConfig}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </QueryClientProvider>
        </AppProvider>
      </AppBridgeProvider>
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