import React, { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Données de test
  const products = [
    {
      id: 1,
      name: 'T-shirt Premium Bio',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
      seoScore: 85,
      status: 'published',
      price: '29.99€',
      category: 'Vêtements'
    },
    {
      id: 2,
      name: 'Sneakers Urbaines',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop',
      seoScore: 45,
      status: 'published',
      price: '89.99€',
      category: 'Chaussures'
    },
    {
      id: 3,
      name: 'Sac à dos Voyage',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop',
      seoScore: 78,
      status: 'draft',
      price: '59.99€',
      category: 'Accessoires'
    },
    {
      id: 4,
      name: 'Montre Connectée',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
      seoScore: 32,
      status: 'published',
      price: '199.99€',
      category: 'Électronique'
    },
    {
      id: 5,
      name: 'Casque Audio Premium',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      seoScore: 67,
      status: 'published',
      price: '149.99€',
      category: 'Électronique'
    }
  ];

  const getSeoScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status) => {
    if (status === 'published') {
      return <span className="badge badge-success">Publié</span>;
    }
    return <span className="badge badge-warning">Brouillon</span>;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'low-seo' && product.seoScore < 60) ||
      (filter === 'high-seo' && product.seoScore >= 80);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
              <p className="text-gray-600">Gérez et optimisez le SEO de vos produits</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Nouveau produit
              </button>
              <button className="btn-secondary">
                <SparklesIcon className="h-5 w-5 mr-2" />
                Optimiser sélection
              </button>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Filtres */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">Tous les produits</option>
              <option value="low-seo">Score SEO faible (&lt; 60)</option>
              <option value="high-seo">Score SEO élevé (≥ 80)</option>
            </select>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
            <div className="text-sm text-gray-600">Produits totaux</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.seoScore >= 80).length}
            </div>
            <div className="text-sm text-gray-600">Score SEO excellent</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {products.filter(p => p.seoScore >= 60 && p.seoScore < 80).length}
            </div>
            <div className="text-sm text-gray-600">Score SEO moyen</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.seoScore < 60).length}
            </div>
            <div className="text-sm text-gray-600">À optimiser</div>
          </div>
        </div>

        {/* Liste des produits */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Liste des produits ({filteredProducts.length})
            </h2>
          </div>
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score SEO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.image}
                            alt={product.name}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getSeoScoreColor(product.seoScore)}`}>
                          {product.seoScore}/100
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            Modifier
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Optimiser
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg font-medium">Aucun produit trouvé</p>
              <p>Essayez de modifier vos critères de recherche</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products; 