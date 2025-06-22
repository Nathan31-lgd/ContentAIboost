import React, { useState } from 'react';
import { SparklesIcon, PlayIcon } from '@heroicons/react/24/outline';

const BulkOptimization = () => {
  const [selectedType, setSelectedType] = useState('products');
  const [selectedAI, setSelectedAI] = useState('chatgpt');
  const [isRunning, setIsRunning] = useState(false);

  const handleStartOptimization = () => {
    setIsRunning(true);
    // Simulation d'optimisation
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Optimisation en masse</h1>
          <p className="text-gray-600">Optimisez plusieurs éléments en une seule fois avec l'IA</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Configuration de l'optimisation</h2>
          </div>
          <div className="card-body space-y-6">
            {/* Type d'optimisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Que souhaitez-vous optimiser ?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Optimiser les titres</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Améliorer les descriptions</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Générer des mots-clés SEO</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                  <span className="ml-2 text-sm text-gray-700">Optimiser les métadonnées</span>
                </label>
              </div>
            </div>

            {/* Progression */}
            {isRunning && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="spinner spinner-sm mr-2"></div>
                  <span className="text-sm font-medium text-blue-900">Optimisation en cours...</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-blue-700 mt-2">Traitement: 13/20 produits</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button className="btn-secondary" disabled={isRunning}>
                Annuler
              </button>
              <button 
                className="btn-primary" 
                onClick={handleStartOptimization}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <div className="spinner spinner-sm mr-2"></div>
                    Optimisation...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Lancer l'optimisation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-blue-600">127</div>
              <div className="text-sm text-gray-600">Éléments à optimiser</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-green-600">89</div>
              <div className="text-sm text-gray-600">Déjà optimisés</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-yellow-600">38</div>
              <div className="text-sm text-gray-600">Score moyen actuel</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOptimization; 