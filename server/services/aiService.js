import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';
import { AI_CONFIG, SEO_PROMPTS } from '../../shared/constants/index.js';
import { AIProviderTypes } from '../../shared/types/index.js';

class AIService {
  constructor() {
    this.providers = {};
  }

  // Initialiser un fournisseur IA
  initializeProvider(provider, apiKey) {
    try {
      switch (provider) {
        case AIProviderTypes.OPENAI:
          this.providers[provider] = new OpenAI({
            apiKey: apiKey
          });
          break;

        case AIProviderTypes.ANTHROPIC:
          this.providers[provider] = new Anthropic({
            apiKey: apiKey
          });
          break;

        case AIProviderTypes.GOOGLE:
          this.providers[provider] = new GoogleGenerativeAI(apiKey);
          break;

        default:
          throw new Error(`Fournisseur IA non supporté: ${provider}`);
      }

      logger.info(`✅ Fournisseur IA ${provider} initialisé`);
    } catch (error) {
      logger.error(`❌ Erreur lors de l'initialisation du fournisseur ${provider}:`, error);
      throw error;
    }
  }

  // Générer du contenu avec l'IA
  async generateContent(provider, prompt, context = '') {
    try {
      if (!this.providers[provider]) {
        throw new Error(`Fournisseur ${provider} non initialisé`);
      }

      const config = AI_CONFIG[provider.toUpperCase()];
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

      let response;

      switch (provider) {
        case AIProviderTypes.OPENAI:
          response = await this.providers[provider].chat.completions.create({
            model: config.model,
            messages: [
              {
                role: 'system',
                content: 'Tu es un expert en SEO et marketing e-commerce. Tu aides à optimiser le contenu des produits et collections Shopify.'
              },
              {
                role: 'user',
                content: fullPrompt
              }
            ],
            max_tokens: config.maxTokens,
            temperature: config.temperature
          });
          return response.choices[0].message.content.trim();

        case AIProviderTypes.ANTHROPIC:
          response = await this.providers[provider].messages.create({
            model: config.model,
            max_tokens: config.maxTokens,
            temperature: config.temperature,
            messages: [
              {
                role: 'user',
                content: fullPrompt
              }
            ]
          });
          return response.content[0].text.trim();

        case AIProviderTypes.GOOGLE:
          const model = this.providers[provider].getGenerativeModel({
            model: config.model
          });
          response = await model.generateContent(fullPrompt);
          return response.response.text().trim();

        default:
          throw new Error(`Fournisseur non supporté: ${provider}`);
      }
    } catch (error) {
      logger.error(`Erreur lors de la génération de contenu avec ${provider}:`, error);
      throw new Error(`Erreur IA: ${error.message}`);
    }
  }

  // Optimiser le titre SEO
  async optimizeTitle(provider, productData) {
    const context = `Produit: ${productData.title}\nDescription: ${productData.description}\nTags: ${productData.tags?.join(', ')}\nCollections: ${productData.collections?.join(', ')}`;
    return await this.generateContent(provider, SEO_PROMPTS.TITLE_OPTIMIZATION, context);
  }

  // Optimiser la description SEO
  async optimizeDescription(provider, productData) {
    const context = `Produit: ${productData.title}\nDescription actuelle: ${productData.description}\nTags: ${productData.tags?.join(', ')}\nCollections: ${productData.collections?.join(', ')}`;
    return await this.generateContent(provider, SEO_PROMPTS.DESCRIPTION_OPTIMIZATION, context);
  }

  // Générer des mots-clés SEO
  async generateKeywords(provider, productData) {
    const context = `Produit: ${productData.title}\nDescription: ${productData.description}\nTags actuels: ${productData.tags?.join(', ')}\nCollections: ${productData.collections?.join(', ')}`;
    const keywords = await this.generateContent(provider, SEO_PROMPTS.KEYWORDS_GENERATION, context);
    return keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
  }

  // Optimiser le texte alternatif d'image
  async optimizeImageAlt(provider, imageData, productData) {
    const context = `Produit: ${productData.title}\nDescription: ${productData.description}\nTags: ${productData.tags?.join(', ')}\nNom de l'image: ${imageData.filename || 'image produit'}`;
    return await this.generateContent(provider, SEO_PROMPTS.IMAGE_ALT_OPTIMIZATION, context);
  }

  // Analyser le contenu existant et suggérer des améliorations
  async analyzeContent(provider, productData) {
    const context = `Analyse ce produit et suggère des améliorations SEO:\n\nTitre: ${productData.title}\nDescription: ${productData.description}\nTags: ${productData.tags?.join(', ')}\nCollections: ${productData.collections?.join(', ')}\nImages: ${productData.images?.length || 0} image(s)`;
    
    const prompt = `Analyse ce produit et fournis des suggestions d'amélioration SEO structurées:
1. Titre SEO (actuel: "${productData.title}")
2. Description SEO (actuelle: "${productData.description}")
3. Mots-clés recommandés
4. Améliorations des images
5. Score SEO estimé (0-100)

Réponds au format JSON:
{
  "title": "titre optimisé",
  "description": "description optimisée", 
  "keywords": ["mot-clé1", "mot-clé2"],
  "imageSuggestions": "suggestions pour les images",
  "seoScore": 75,
  "improvements": ["amélioration1", "amélioration2"]
}`;

    const response = await this.generateContent(provider, prompt, context);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      logger.error('Erreur lors du parsing de la réponse IA:', error);
      return {
        title: productData.title,
        description: productData.description,
        keywords: productData.tags || [],
        imageSuggestions: 'Vérifier les textes alternatifs des images',
        seoScore: 50,
        improvements: ['Analyser manuellement les suggestions']
      };
    }
  }

  // Optimiser en masse plusieurs produits
  async bulkOptimize(provider, productsData) {
    const results = [];
    
    for (const product of productsData) {
      try {
        const optimization = await this.analyzeContent(provider, product);
        results.push({
          productId: product.id,
          success: true,
          data: optimization
        });
      } catch (error) {
        results.push({
          productId: product.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Vérifier la validité d'une clé API
  async validateApiKey(provider, apiKey) {
    try {
      this.initializeProvider(provider, apiKey);
      
      // Test simple pour valider la clé
      const testPrompt = 'Réponds simplement "OK"';
      await this.generateContent(provider, testPrompt);
      
      return true;
    } catch (error) {
      logger.error(`Clé API invalide pour ${provider}:`, error);
      return false;
    }
  }
}

export default new AIService(); 