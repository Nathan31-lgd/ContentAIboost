import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { createApp } from '@shopify/app-bridge';
import App from './App';
import './styles/index.css';

// Configuration App Bridge
const config = {
  apiKey: import.meta.env.VITE_SHOPIFY_API_KEY || 'your-api-key',
  host: new URLSearchParams(window.location.search).get('host') || '',
  forceRedirect: true
};

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