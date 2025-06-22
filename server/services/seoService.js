import { SEO_CRITERIA_WEIGHTS, IMAGE_CONFIG } from '../../shared/constants/index.js';
import { logger } from '../utils/logger.js';

class SEOService {
  constructor() {
    this.weights = SEO_CRITERIA_WEIGHTS;
  }

  // Calculer le score SEO global d'un produit/collection
  calculateSEOScore(content) {
    try {
      let totalScore = 0;
      const scores = {};

      // Score du titre
      scores.title = this.calculateTitleScore(content.title);
      totalScore += scores.title * this.weights.title / 100;

      // Score de la description
      scores.description = this.calculateDescriptionScore(content.description);
      totalScore += scores.description * this.weights.description / 100;

      // Score des mots-clés
      scores.keywords = this.calculateKeywordsScore(content.keywords, content.title, content.description);
      totalScore += scores.keywords * this.weights.keywords / 100;

      // Score des images
      scores.imageQuality = this.calculateImageScore(content.images);
      totalScore += scores.imageQuality * this.weights.imageQuality / 100;

      // Score de la structure HTML
      scores.structure = this.calculateStructureScore(content);
      totalScore += scores.structure * (this.weights.h1 + this.weights.h2 + this.weights.h3) / 100;

      // Score de la longueur du contenu
      scores.contentLength = this.calculateContentLengthScore(content);
      totalScore += scores.contentLength * this.weights.contentLength / 100;

      return {
        totalScore: Math.round(totalScore),
        scores,
        details: this.generateSEODetails(scores, content)
      };
    } catch (error) {
      logger.error('Erreur lors du calcul du score SEO:', error);
      return {
        totalScore: 0,
        scores: {},
        details: ['Erreur lors du calcul du score SEO']
      };
    }
  }

  // Calculer le score du titre
  calculateTitleScore(title) {
    if (!title || title.length === 0) return 0;

    let score = 0;

    // Longueur optimale (50-60 caractères)
    if (title.length >= 30 && title.length <= 60) {
      score += 40;
    } else if (title.length > 60) {
      score += Math.max(0, 40 - (title.length - 60) * 2);
    } else {
      score += Math.max(0, title.length * 1.3);
    }

    // Présence de mots-clés principaux
    if (this.containsKeywords(title)) {
      score += 30;
    }

    // Caractères spéciaux et formatage
    if (title.includes('-') || title.includes('|')) {
      score += 15;
    }

    // Mots d'action
    const actionWords = ['acheter', 'découvrir', 'nouveau', 'meilleur', 'premium', 'exclusif'];
    if (actionWords.some(word => title.toLowerCase().includes(word))) {
      score += 15;
    }

    return Math.min(100, score);
  }

  // Calculer le score de la description
  calculateDescriptionScore(description) {
    if (!description || description.length === 0) return 0;

    let score = 0;

    // Longueur optimale (150-300 caractères)
    if (description.length >= 120 && description.length <= 320) {
      score += 40;
    } else if (description.length > 320) {
      score += Math.max(0, 40 - (description.length - 320) * 0.5);
    } else {
      score += Math.max(0, description.length * 0.3);
    }

    // Présence de mots-clés
    if (this.containsKeywords(description)) {
      score += 30;
    }

    // Appel à l'action
    const callToAction = ['acheter', 'commander', 'découvrir', 'en savoir plus', 'voir plus'];
    if (callToAction.some(cta => description.toLowerCase().includes(cta))) {
      score += 20;
    }

    // Structure avec paragraphes
    if (description.includes('\n') || description.includes('.')) {
      score += 10;
    }

    return Math.min(100, score);
  }

  // Calculer le score des mots-clés
  calculateKeywordsScore(keywords, title, description) {
    if (!keywords || keywords.length === 0) return 0;

    let score = 0;
    const allText = `${title} ${description}`.toLowerCase();

    // Nombre de mots-clés
    if (keywords.length >= 3 && keywords.length <= 10) {
      score += 30;
    } else if (keywords.length > 10) {
      score += Math.max(0, 30 - (keywords.length - 10) * 2);
    } else {
      score += keywords.length * 10;
    }

    // Présence des mots-clés dans le contenu
    const presentKeywords = keywords.filter(keyword => 
      allText.includes(keyword.toLowerCase())
    );
    score += (presentKeywords.length / keywords.length) * 40;

    // Diversité des mots-clés
    const uniqueKeywords = [...new Set(keywords)];
    score += (uniqueKeywords.length / keywords.length) * 30;

    return Math.min(100, score);
  }

  // Calculer le score des images
  calculateImageScore(images) {
    if (!images || images.length === 0) return 0;

    let score = 0;

    // Nombre d'images
    if (images.length >= 1 && images.length <= 5) {
      score += 30;
    } else if (images.length > 5) {
      score += Math.max(0, 30 - (images.length - 5) * 3);
    }

    // Qualité des images (vérification basique)
    const highQualityImages = images.filter(img => {
      return img.width >= 800 && img.height >= 600;
    });
    score += (highQualityImages.length / images.length) * 40;

    // Textes alternatifs
    const imagesWithAlt = images.filter(img => img.alt && img.alt.length > 0);
    score += (imagesWithAlt.length / images.length) * 30;

    return Math.min(100, score);
  }

  // Calculer le score de la structure HTML
  calculateStructureScore(content) {
    let score = 0;

    // Présence de H1
    if (content.h1 && content.h1.length > 0) {
      score += 30;
    }

    // Présence de H2
    if (content.h2 && content.h2.length > 0) {
      score += Math.min(40, content.h2.length * 10);
    }

    // Présence de H3
    if (content.h3 && content.h3.length > 0) {
      score += Math.min(30, content.h3.length * 5);
    }

    return Math.min(100, score);
  }

  // Calculer le score de la longueur du contenu
  calculateContentLengthScore(content) {
    const totalLength = (content.title?.length || 0) + (content.description?.length || 0);
    
    if (totalLength >= 500 && totalLength <= 2000) {
      return 100;
    } else if (totalLength > 2000) {
      return Math.max(0, 100 - (totalLength - 2000) * 0.02);
    } else {
      return Math.min(100, totalLength * 0.2);
    }
  }

  // Vérifier la présence de mots-clés
  containsKeywords(text) {
    if (!text) return false;
    
    // Mots-clés génériques e-commerce
    const commonKeywords = [
      'produit', 'qualité', 'prix', 'livraison', 'garantie', 'service',
      'client', 'avis', 'recommandé', 'populaire', 'nouveau', 'exclusif'
    ];
    
    return commonKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  // Générer les détails SEO
  generateSEODetails(scores, content) {
    const details = [];

    // Titre
    if (scores.title < 70) {
      details.push('Optimiser la longueur du titre (30-60 caractères)');
      if (!this.containsKeywords(content.title)) {
        details.push('Ajouter des mots-clés pertinents dans le titre');
      }
    }

    // Description
    if (scores.description < 70) {
      details.push('Améliorer la description (120-320 caractères)');
      if (!this.containsKeywords(content.description)) {
        details.push('Intégrer des mots-clés dans la description');
      }
    }

    // Mots-clés
    if (scores.keywords < 70) {
      details.push('Ajouter plus de mots-clés pertinents');
      details.push('S\'assurer que les mots-clés sont présents dans le contenu');
    }

    // Images
    if (scores.imageQuality < 70) {
      details.push('Améliorer la qualité des images (min 800x600px)');
      details.push('Ajouter des textes alternatifs aux images');
    }

    // Structure
    if (scores.structure < 70) {
      details.push('Ajouter des balises H1, H2, H3 pour structurer le contenu');
    }

    // Longueur du contenu
    if (scores.contentLength < 70) {
      details.push('Enrichir le contenu avec plus de détails');
    }

    return details.length > 0 ? details : ['Contenu SEO bien optimisé !'];
  }

  // Analyser la densité de mots-clés
  analyzeKeywordDensity(text, keywords) {
    if (!text || !keywords || keywords.length === 0) {
      return {};
    }

    const textLower = text.toLowerCase();
    const density = {};

    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase(), 'g');
      const matches = textLower.match(regex);
      const count = matches ? matches.length : 0;
      const densityPercent = (count / text.split(' ').length) * 100;
      
      density[keyword] = {
        count,
        density: Math.round(densityPercent * 100) / 100
      };
    });

    return density;
  }

  // Suggérer des améliorations SEO
  suggestImprovements(content) {
    const suggestions = [];
    const score = this.calculateSEOScore(content);

    if (score.totalScore < 50) {
      suggestions.push('Score SEO faible - Optimisation majeure nécessaire');
    } else if (score.totalScore < 70) {
      suggestions.push('Score SEO moyen - Améliorations recommandées');
    } else if (score.totalScore < 90) {
      suggestions.push('Score SEO bon - Optimisations mineures possibles');
    } else {
      suggestions.push('Score SEO excellent - Maintien recommandé');
    }

    // Suggestions spécifiques basées sur les scores
    Object.entries(score.scores).forEach(([criterion, score]) => {
      if (score < 50) {
        suggestions.push(`Améliorer ${criterion} (score actuel: ${score}/100)`);
      }
    });

    return suggestions;
  }
}

export default new SEOService(); 