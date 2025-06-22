import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Collections from './pages/Collections';
import BulkOptimization from './pages/BulkOptimization';
import Settings from './pages/Settings';
import './styles/index.css';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/bulk-optimization" element={<BulkOptimization />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App; 