import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { NavigationMenu } from '@shopify/app-bridge-react';

// Import des pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Settings from './pages/Settings';
// Les pages suivantes ne sont pas encore dans le menu mais on les garde
import Collections from './pages/Collections';
import BulkOptimization from './pages/BulkOptimization';
import Loading from './pages/Loading';

function App() {
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

  return (
    <>
      <NavigationMenu navigationLinks={navigationLinks} />
      
      <div className="min-h-screen">
        <Toaster position="top-right" />
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/bulk-optimization" element={<BulkOptimization />} />
        </Routes>
      </div>
    </>
  );
}

export default App; 