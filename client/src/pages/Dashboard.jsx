import React from 'react';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  RectangleStackIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  // Données de test
  const stats = [
    {
      name: 'Produits totaux',
      value: '127',
      change: '+12%',
      changeType: 'positive',
      icon: ShoppingBagIcon,
    },
    {
      name: 'Collections',
      value: '23',
      change: '+3%',
      changeType: 'positive',
      icon: RectangleStackIcon,
    },
    {
      name: 'Score SEO moyen',
      value: '72/100',
      change: '+8%',
      changeType: 'positive',
      icon: ChartBarIcon,
    },
    {
      name: 'Optimisations IA',
      value: '89',
      change: '+24%',
      changeType: 'positive',
      icon: SparklesIcon,
    },
  ];

  const recentProducts = [
    {
      id: 1,
      name: 'T-shirt Premium Bio',
      seoScore: 85,
      status: 'optimized',
      lastUpdated: '2024-01-15',
    },
    {
      id: 2,
      name: 'Sneakers Urbaines',
      seoScore: 45,
      status: 'needs-optimization',
      lastUpdated: '2024-01-14',
    },
    {
      id: 3,
      name: 'Sac à dos Voyage',
      seoScore: 78,
      status: 'optimized',
      lastUpdated: '2024-01-13',
    },
    {
      id: 4,
      name: 'Montre Connectée',
      seoScore: 32,
      status: 'needs-optimization',
      lastUpdated: '2024-01-12',
    },
  ];

  const getSeoScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status) => {
    if (status === 'optimized') {
      return <span className="badge badge-success">Optimisé</span>;
    }
    return <span className="badge badge-warning">À optimiser</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord ContentAIBoost
          </h1>
          <p className="text-gray-600">
            Optimisez le SEO de vos produits et collections avec l'intelligence artificielle
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className={`ml-2 text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Produits récents */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Produits récents</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">Mis à jour le {product.lastUpdated}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeoScoreColor(product.seoScore)}`}>
                        {product.seoScore}/100
                      </div>
                      {getStatusBadge(product.status)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="btn-primary w-full">
                  Voir tous les produits
                </button>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <button className="w-full flex items-center p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <SparklesIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Optimisation IA en masse</h3>
                    <p className="text-sm text-gray-600">Optimisez tous vos produits en une fois</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Analyser les performances</h3>
                    <p className="text-sm text-gray-600">Voir l'impact de vos optimisations</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center p-4 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Produits à optimiser</h3>
                    <p className="text-sm text-gray-600">23 produits avec un score SEO faible</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conseils SEO */}
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">💡 Conseils SEO du jour</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Titres optimisés</h3>
                  <p className="text-sm text-gray-600">Utilisez des mots-clés pertinents dans vos titres de produits</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">2</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Descriptions riches</h3>
                  <p className="text-sm text-gray-600">Rédigez des descriptions détaillées et engageantes</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">3</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Images Alt Text</h3>
                  <p className="text-sm text-gray-600">N'oubliez pas les textes alternatifs pour vos images</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 