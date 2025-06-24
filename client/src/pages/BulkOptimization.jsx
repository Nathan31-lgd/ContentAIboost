import React, { useState, useEffect, useCallback } from 'react';
import { SparklesIcon, PlayIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import { useShopify } from '../contexts/ShopifyContext';
import toast from 'react-hot-toast';

const BulkOptimization = () => {
  const { showToast } = useShopify();
  const [selectedType, setSelectedType] = useState('products');
  const [selectedAI, setSelectedAI] = useState('chatgpt');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [processedItems, setProcessedItems] = useState(0);
  
  // États pour les éléments
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // États pour les options d'optimisation
  const [optimizationOptions, setOptimizationOptions] = useState({
    titles: true,
    descriptions: true,
    keywords: true,
    metadata: false,
    seo: true
  });

  // Charger les éléments selon le type sélectionné
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setSelectedItems([]);
      
      if (selectedType === 'products') {
        const response = await api.products.getAll();
        setProducts(response.products || []);
        setCollections([]);
      } else {
        const response = await api.collections.getAll();
        setCollections(response.collections || []);
        setProducts([]);
      }
    } catch (error) {
      console.error(`Erreur lors du chargement des ${selectedType}:`, error);
      toast.error(`Impossible de charger les ${selectedType}`);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Gérer la sélection d'éléments
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Gérer la sélection/désélection de tous les éléments
  const handleSelectAll = () => {
    const currentItems = selectedType === 'products' ? products : collections;
    const currentItemIds = currentItems.map(item => item.id);
    
    if (selectedItems.length === currentItemIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItemIds);
    }
  };

  // Obtenir les options d'optimisation selon le type
  const getOptimizationOptions = () => {
    if (selectedType === 'products') {
      return [
        { key: 'titles', label: 'Optimiser les titres', defaultChecked: true },
        { key: 'descriptions', label: 'Améliorer les descriptions', defaultChecked: true },
        { key: 'keywords', label: 'Générer des mots-clés SEO', defaultChecked: true },
        { key: 'metadata', label: 'Optimiser les métadonnées', defaultChecked: false },
        { key: 'seo', label: 'Améliorer le score SEO', defaultChecked: true }
      ];
    } else {
      return [
        { key: 'titles', label: 'Optimiser les titres', defaultChecked: true },
        { key: 'descriptions', label: 'Améliorer les descriptions', defaultChecked: true },
        { key: 'keywords', label: 'Générer des mots-clés SEO', defaultChecked: true },
        { key: 'metadata', label: 'Optimiser les métadonnées', defaultChecked: true },
        { key: 'seo', label: 'Améliorer le score SEO', defaultChecked: true }
      ];
    }
  };

  // Lancer l'optimisation
  const handleStartOptimization = async () => {
    if (selectedItems.length === 0) {
      toast.error('Veuillez sélectionner des éléments à optimiser');
      return;
    }

    try {
      setIsRunning(true);
      setProgress(0);
      setProcessedItems(0);
      setTotalItems(selectedItems.length);

      // Préparer les données d'optimisation
      const optimizationData = {
        type: selectedType,
        itemIds: selectedItems,
        ai: selectedAI,
        options: optimizationOptions
      };

      // Lancer l'optimisation via l'API
      const response = await api.optimizations.bulkOptimize(optimizationData);
      
      if (response.success) {
        toast.success(`Optimisation de ${selectedItems.length} ${selectedType} lancée avec succès`);
        
        // Simuler la progression (dans un vrai cas, on utiliserait WebSockets ou polling)
        for (let i = 0; i <= selectedItems.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setProgress((i / selectedItems.length) * 100);
          setProcessedItems(i);
          
          const currentItems = selectedType === 'products' ? products : collections;
          const currentItem = currentItems.find(item => item.id === selectedItems[i - 1]);
          setCurrentItem(currentItem ? currentItem.title : '');
        }
        
        // Recharger les éléments pour voir les changements
        await loadItems();
        setSelectedItems([]);
        
      } else {
        toast.error(response.message || 'Erreur lors du lancement de l\'optimisation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      toast.error('Erreur lors du lancement de l\'optimisation');
    } finally {
      setIsRunning(false);
      setProgress(0);
      setCurrentItem('');
    }
  };

  // Obtenir les éléments actuels
  const currentItems = selectedType === 'products' ? products : collections;
  const isAllSelected = currentItems.length > 0 && selectedItems.length === currentItems.length;

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Optimisation en masse</h1>
          <p className="text-gray-600">Optimisez plusieurs éléments en une seule fois avec l'IA</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
              </div>
              <div className="card-body space-y-6">
                {/* Type d'optimisation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Que souhaitez-vous optimiser ?
                  </label>
                  <div className="space-y-3">
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedType === 'products' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedType('products')}
                    >
                      <h3 className="font-medium text-gray-900">Produits</h3>
                      <p className="text-sm text-gray-600">Optimiser les titres, descriptions et mots-clés</p>
                    </div>
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedType === 'collections' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedType('collections')}
                    >
                      <h3 className="font-medium text-gray-900">Collections</h3>
                      <p className="text-sm text-gray-600">Optimiser les descriptions et métadonnées</p>
                    </div>
                  </div>
                </div>

                {/* IA sélectionnée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Intelligence artificielle
                  </label>
                  <select 
                    value={selectedAI} 
                    onChange={(e) => setSelectedAI(e.target.value)}
                    className="form-select"
                  >
                    <option value="chatgpt">ChatGPT (OpenAI)</option>
                    <option value="claude">Claude (Anthropic)</option>
                    <option value="gemini">Gemini (Google)</option>
                  </select>
                </div>

                {/* Options d'optimisation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Options d'optimisation
                  </label>
                  <div className="space-y-3">
                    {getOptimizationOptions().map((option) => (
                      <label key={option.key} className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600"
                          checked={optimizationOptions[option.key]}
                          onChange={(e) => setOptimizationOptions(prev => ({
                            ...prev,
                            [option.key]: e.target.checked
                          }))}
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4">
                  <button 
                    className="btn-primary w-full" 
                    onClick={handleStartOptimization}
                    disabled={isRunning || selectedItems.length === 0}
                  >
                    {isRunning ? (
                      <>
                        <div className="spinner spinner-sm mr-2"></div>
                        Optimisation...
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-5 w-5 mr-2" />
                        Lancer l'optimisation ({selectedItems.length})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des éléments */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedType === 'products' ? 'Produits' : 'Collections'} 
                    ({currentItems.length})
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button 
                      className="btn-secondary text-sm"
                      onClick={handleSelectAll}
                      disabled={loading}
                    >
                      {isAllSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                    <button 
                      className="btn-secondary text-sm"
                      onClick={loadItems}
                      disabled={loading}
                    >
                      {loading ? 'Chargement...' : 'Actualiser'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="spinner spinner-lg"></div>
                  </div>
                ) : currentItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun {selectedType === 'products' ? 'produit' : 'collection'} trouvé
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {currentItems.map((item) => {
                      const isSelected = selectedItems.includes(item.id);
                      const seoScore = item.seo_score || 0;
                      
                      return (
                        <div 
                          key={item.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSelectItem(item.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{item.title}</h3>
                                <p className="text-sm text-gray-600">
                                  {selectedType === 'products' 
                                    ? `${item.variants_count || 0} variantes`
                                    : `${item.products_count || 0} produits`
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                seoScore >= 80 ? 'bg-green-100 text-green-800' :
                                seoScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                SEO: {seoScore}/100
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progression */}
        {isRunning && (
          <div className="mt-6 card">
            <div className="card-body">
              <div className="flex items-center mb-4">
                <div className="spinner spinner-sm mr-3"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Optimisation en cours...</h3>
                  <p className="text-sm text-gray-600">
                    {currentItem && `Traitement: ${currentItem}`}
                  </p>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progression</span>
                  <span>{processedItems}/{totalItems} ({Math.round(progress)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-blue-600">{currentItems.length}</div>
              <div className="text-sm text-gray-600">Total {selectedType}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentItems.filter(item => (item.seo_score || 0) >= 80).length}
              </div>
              <div className="text-sm text-gray-600">Optimisés</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(currentItems.reduce((sum, item) => sum + (item.seo_score || 0), 0) / Math.max(currentItems.length, 1))}
              </div>
              <div className="text-sm text-gray-600">Score moyen</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-purple-600">{selectedItems.length}</div>
              <div className="text-sm text-gray-600">Sélectionnés</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOptimization; 