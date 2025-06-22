// Types pour les produits Shopify
export const ProductTypes = {
  PRODUCT: 'product',
  COLLECTION: 'collection'
}

// Types pour les API IA
export const AIProviderTypes = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google'
}

// Types pour les plans d'abonnement
export const SubscriptionPlans = {
  FREE: 'free',
  PREMIUM: 'premium'
}

// Types pour les tâches d'optimisation
export const OptimizationTaskTypes = {
  TITLE: 'title',
  DESCRIPTION: 'description',
  KEYWORDS: 'keywords',
  IMAGE_ALT: 'image_alt',
  IMAGE_COMPRESSION: 'image_compression',
  SEO_SCORE: 'seo_score'
}

// Types pour les statuts de tâches
export const TaskStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

// Structure d'un produit
export const ProductSchema = {
  id: String,
  title: String,
  description: String,
  handle: String,
  images: Array,
  tags: Array,
  collections: Array,
  seoScore: Number,
  seoData: {
    title: String,
    description: String,
    keywords: Array,
    imageAlt: String,
    h1: String,
    h2: Array,
    h3: Array
  },
  createdAt: Date,
  updatedAt: Date
}

// Structure d'une collection
export const CollectionSchema = {
  id: String,
  title: String,
  description: String,
  handle: String,
  image: Object,
  products: Array,
  seoScore: Number,
  seoData: {
    title: String,
    description: String,
    keywords: Array,
    imageAlt: String
  },
  createdAt: Date,
  updatedAt: Date
}

// Structure d'un utilisateur
export const UserSchema = {
  id: String,
  shop: String,
  email: String,
  subscriptionPlan: String,
  aiApiKeys: {
    openai: String,
    anthropic: String,
    google: String
  },
  usage: {
    dailyOptimizations: Number,
    monthlyOptimizations: Number,
    lastResetDate: Date
  },
  createdAt: Date,
  updatedAt: Date
}

// Structure d'une tâche d'optimisation
export const OptimizationTaskSchema = {
  id: String,
  userId: String,
  shopId: String,
  type: String,
  targetId: String,
  targetType: String,
  status: String,
  progress: Number,
  result: Object,
  error: String,
  createdAt: Date,
  updatedAt: Date
} 