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
const urlParams = new URLSearchParams(window.location.search);
const shop = urlParams.get('shop');
const host = urlParams.get('host');

console.log('=== Shopify App Debug ===');
console.log('Current URL:', window.location.href);
console.log('Shop:', shop);
console.log('Host:', host);
console.log('All params:', Object.fromEntries(urlParams));

const config = {
  apiKey: import.meta.env.VITE_SHOPIFY_API_KEY || 'e64a4504c28e6dfa3bd96ecb7c6e55a8',
  host: host || '',
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
  // Vérifier si on a les paramètres Shopify nécessaires
  if (!host || !shop) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <h1>ContentAIBoost</h1>
        <p>Erreur : Paramètres Shopify manquants</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Shop: {shop || 'Non défini'}<br />
          Host: {host || 'Non défini'}
        </p>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
          Cette application doit être lancée depuis l'admin Shopify
        </p>
      </div>
    );
  }

  return (
    <Provider config={config}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App; 