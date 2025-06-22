import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingBagIcon,
  RectangleStackIcon,
  SparklesIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
    },
    {
      name: 'Produits',
      href: '/products',
      icon: ShoppingBagIcon,
    },
    {
      name: 'Collections',
      href: '/collections',
      icon: RectangleStackIcon,
    },
    {
      name: 'Optimisation en masse',
      href: '/bulk-optimization',
      icon: SparklesIcon,
    },
    {
      name: 'Paramètres',
      href: '/settings',
      icon: CogIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <div className="flex items-center">
            <SparklesIcon className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">ContentAIBoost</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Stats rapides */}
        <div className="mt-8 px-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Score SEO moyen</h3>
            <div className="flex items-center">
              <div className="flex-1 bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
              <span className="ml-2 text-sm font-medium text-blue-900">72/100</span>
            </div>
          </div>
        </div>

        {/* Aide rapide */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">💡 Astuce</h3>
            <p className="text-xs text-gray-600">
              Utilisez l'optimisation en masse pour améliorer rapidement le SEO de tous vos produits !
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {navigation.find(item => item.href === location.pathname)?.name || 'ContentAIBoost'}
                </h1>
                <p className="text-sm text-gray-500">
                  Optimisez votre SEO avec l'intelligence artificielle
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Boutique info */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">contentboostai.myshopify.com</p>
                  <p className="text-xs text-gray-500">Boutique connectée</p>
                </div>
                
                {/* Status indicator */}
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="ml-2 text-xs text-gray-500">En ligne</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 