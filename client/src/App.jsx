import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { NavigationMenu } from '@shopify/app-bridge-react';

// Import des pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Collections from './pages/Collections';
import BulkOptimization from './pages/BulkOptimization';
import Settings from './pages/Settings';
import Loading from './pages/Loading';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

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
      label: 'Paramètres',
      destination: '/settings',
    },
  ];

  // Logic pour faire correspondre la route actuelle au menu
  const Matcher = (link, currentPath) => {
      if (link.destination === '/') {
          return currentPath === link.destination;
      }
      return currentPath.startsWith(link.destination);
  }

  return (
    <>
      <NavigationMenu
        navigationLinks={navigationLinks}
        matcher={Matcher}
        onNavigate={(link) => navigate(link.destination)}
      />
      <div className="min-h-screen">
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

export default App; 