import React, { useState } from 'react';
import { KeyIcon, SparklesIcon, CogIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Paramètres</h1>
          <p className="text-gray-600">Configurez vos clés API et préférences d'optimisation</p>
        </div>

        <div className="space-y-8">
          {/* Clés API */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <KeyIcon className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Clés API Intelligence Artificielle</h2>
              </div>
            </div>
            <div className="card-body space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key (ChatGPT)
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="form-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Obtenez votre clé sur <a href="https://platform.openai.com" className="text-blue-600">platform.openai.com</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anthropic API Key (Claude)
                </label>
                <input
                  type="password"
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="form-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Obtenez votre clé sur <a href="https://console.anthropic.com" className="text-blue-600">console.anthropic.com</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google AI API Key (Gemini)
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AI..."
                  className="form-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Obtenez votre clé sur <a href="https://makersuite.google.com" className="text-blue-600">makersuite.google.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* Préférences d'optimisation */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <SparklesIcon className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Préférences d'optimisation</h2>
              </div>
            </div>
            <div className="card-body space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  IA préférée
                </label>
                <select className="form-select">
                  <option value="chatgpt">ChatGPT (OpenAI)</option>
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="gemini">Gemini (Google)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Langue d'optimisation
                </label>
                <select className="form-select">
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                  <option value="es">Espagnol</option>
                  <option value="de">Allemand</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Options par défaut
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Optimiser automatiquement les titres</span>
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
            </div>
          </div>

          {/* Informations de la boutique */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <CogIcon className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Informations de la boutique</h2>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la boutique
                  </label>
                  <div className="text-sm text-gray-900">contentboostai.myshopify.com</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan d'abonnement
                  </label>
                  <div className="text-sm text-gray-900">
                    <span className="badge badge-info">Gratuit</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Optimisations restantes
                  </label>
                  <div className="text-sm text-gray-900">47 / 50</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut de connexion
                  </label>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-900">Connecté</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button className="btn-secondary">
              Réinitialiser
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSave}
            >
              {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 