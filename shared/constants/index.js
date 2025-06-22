// Limites des plans d'abonnement
export const SUBSCRIPTION_LIMITS = {
  FREE: {
    dailyOptimizations: 20,
    aiProviders: 1,
    bulkOperations: false
  },
  PREMIUM: {
    dailyOptimizations: -1, // Illimité
    aiProviders: 3,
    bulkOperations: true
  }
}

// Scores SEO par critère
export const SEO_CRITERIA_WEIGHTS = {
  title: 15,
  description: 20,
  keywords: 15,
  imageAlt: 10,
  h1: 10,
  h2: 10,
  h3: 5,
  imageQuality: 10,
  contentLength: 5
}

// Messages d'erreur
export const ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: 'Limite quotidienne atteinte. Passez au plan Premium pour des optimisations illimitées.',
  AI_API_ERROR: 'Erreur lors de la communication avec l\'IA. Vérifiez votre clé API.',
  SHOPIFY_API_ERROR: 'Erreur lors de la communication avec Shopify.',
  UNAUTHORIZED: 'Accès non autorisé.',
  VALIDATION_ERROR: 'Données invalides.',
  NETWORK_ERROR: 'Erreur de réseau. Vérifiez votre connexion.',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.'
}

// Messages de succès
export const SUCCESS_MESSAGES = {
  OPTIMIZATION_COMPLETED: 'Optimisation terminée avec succès !',
  PRODUCT_UPDATED: 'Produit mis à jour avec succès.',
  COLLECTION_UPDATED: 'Collection mise à jour avec succès.',
  API_KEY_SAVED: 'Clé API sauvegardée avec succès.',
  BULK_OPERATION_STARTED: 'Opération en masse démarrée.'
}

// Configuration des API IA
export const AI_CONFIG = {
  OPENAI: {
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7
  },
  ANTHROPIC: {
    model: 'claude-3-sonnet-20240229',
    maxTokens: 2000,
    temperature: 0.7
  },
  GOOGLE: {
    model: 'gemini-pro',
    maxTokens: 2000,
    temperature: 0.7
  }
}

// Prompts pour l'optimisation SEO
export const SEO_PROMPTS = {
  TITLE_OPTIMIZATION: `Optimise le titre SEO de ce produit/collection pour améliorer le référencement. 
  Le titre doit être accrocheur, contenir des mots-clés pertinents et faire moins de 60 caractères.`,
  
  DESCRIPTION_OPTIMIZATION: `Rédige une description SEO optimisée pour ce produit/collection. 
  La description doit être informative, persuasive et contenir des mots-clés naturels. 
  Longueur recommandée : 150-300 caractères.`,
  
  KEYWORDS_GENERATION: `Génère une liste de mots-clés SEO pertinents pour ce produit/collection. 
  Inclus des mots-clés principaux, secondaires et long-tail. 
  Retourne uniquement la liste séparée par des virgules.`,
  
  IMAGE_ALT_OPTIMIZATION: `Crée un texte alternatif optimisé pour cette image. 
  Le texte doit être descriptif, contenir des mots-clés pertinents et faire moins de 125 caractères.`
}

// Configuration des images
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  COMPRESSION_QUALITY: 0.8,
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048
}

// Configuration de l'interface
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  AUTO_SAVE_DELAY: 2000,
  MAX_PREVIEW_LENGTH: 150
} 