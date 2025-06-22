import React from 'react';
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Collections = () => {
  const collections = [
    {
      id: 1,
      name: 'Vêtements d\'été',
      productsCount: 24,
      seoScore: 78,
      status: 'published'
    },
    {
      id: 2,
      name: 'Électronique',
      productsCount: 15,
      seoScore: 45,
      status: 'published'
    },
    {
      id: 3,
      name: 'Accessoires',
      productsCount: 32,
      seoScore: 82,
      status: 'published'
    }
  ];

  const getSeoScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
              <p className="text-gray-600">Gérez et optimisez le SEO de vos collections</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Nouvelle collection
              </button>
              <button className="btn-secondary">
                <SparklesIcon className="h-5 w-5 mr-2" />
                Optimiser tout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div key={collection.id} className="card">
              <div className="card-body">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{collection.name}</h3>
                <p className="text-gray-600 mb-4">{collection.productsCount} produits</p>
                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeoScoreColor(collection.seoScore)}`}>
                    {collection.seoScore}/100
                  </div>
                  <button className="btn-primary">Optimiser</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collections; 