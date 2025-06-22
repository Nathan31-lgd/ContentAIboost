import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Provider } from '@shopify/app-bridge-react';
import { NavigationMenu } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import { Toaster } from 'react-hot-toast';

// Import des pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Collections from './pages/Collections';
import BulkOptimization from './pages/BulkOptimization';
import Settings from './pages/Settings';
import Loading from './pages/Loading';

// Configuration App Bridge
const config = {
  apiKey: import.meta.env.VITE_SHOPIFY_API_KEY || 'e64a4504c28e6dfa3bd96ecb7c6e55a8',
  host: new URLSearchParams(window.location.search).get('host') || '',
  forceRedirect: true,
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement initial
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Configuration de la navigation Shopify
  const navigationLinks = [
    {
      label: 'Tableau de bord',
      destination: '/',
    },
    {
      label: 'Produits',
      destination: '/products',
    },
    {
      label: 'Collections',
      destination: '/collections',
    },
    {
      label: 'Optimisation en lot',
      destination: '/bulk-optimization',
    },
    {
      label: 'Paramètres',
      destination: '/settings',
    },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <NavigationMenu
        navigationLinks={navigationLinks}
        matcher={(link, currentPath) => currentPath === link.destination}
        onNavigate={({ destination }) => navigate(destination)}
      />
      
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/bulk-optimization" element={<BulkOptimization />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Provider config={config}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App; 