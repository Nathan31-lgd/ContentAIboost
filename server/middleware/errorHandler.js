import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../../shared/constants/index.js';

export const errorHandler = (err, req, res, next) => {
  // Log de l'erreur
  logger.error('Erreur serveur:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      message: err.message,
      details: err.details
    });
  }

  // Erreurs de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      message: 'Format JSON invalide'
    });
  }

  // Erreurs de limite de taille
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Fichier trop volumineux',
      message: 'La taille du fichier dépasse la limite autorisée'
    });
  }

  // Erreurs de type de fichier
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Type de fichier non autorisé',
      message: 'Le type de fichier n\'est pas supporté'
    });
  }

  // Erreurs de réseau
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: ERROR_MESSAGES.NETWORK_ERROR,
      message: 'Service temporairement indisponible'
    });
  }

  // Erreurs Shopify
  if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      error: ERROR_MESSAGES.SHOPIFY_API_ERROR,
      message: err.message || 'Erreur lors de la communication avec Shopify'
    });
  }

  // Erreurs d'API IA
  if (err.message && (
    err.message.includes('OpenAI') || 
    err.message.includes('Anthropic') || 
    err.message.includes('Google AI')
  )) {
    return res.status(500).json({
      error: ERROR_MESSAGES.AI_API_ERROR,
      message: 'Erreur lors de la communication avec l\'IA'
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || ERROR_MESSAGES.UNKNOWN_ERROR;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

// Middleware pour capturer les erreurs asynchrones
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Fonction utilitaire pour créer des erreurs personnalisées
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Fonction pour gérer les erreurs de validation
export const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => err.message);
  const message = `Données invalides: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Fonction pour gérer les erreurs de clé dupliquée
export const handleDuplicateKeyError = (error) => {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Valeur dupliquée: ${value}. Veuillez utiliser une autre valeur.`;
  return new AppError(message, 400);
}; 