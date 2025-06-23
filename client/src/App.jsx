import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import des pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Collections from './pages/Collections';
import BulkOptimization from './pages/BulkOptimization';
import Settings from './pages/Settings';
import Loading from './pages/Loading';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement initial
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
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
  );
}

export default App; 