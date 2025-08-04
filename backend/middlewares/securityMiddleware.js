// backend/middlewares/securityMiddleware.js - Middleware de sécurité centralisé
import { SECURITY_CONFIG } from '../config/security.js';

/**
 * 🛡️ Middleware de sécurité global
 */
export const securityMiddleware = (req, res, next) => {
  // Appliquer les headers de sécurité
  Object.entries(SECURITY_CONFIG.SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  // Supprimer les headers qui révèlent des informations
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * 🔒 Middleware pour empêcher l'injection de mode d'auth
 */
export const preventAuthModeInjection = (req, res, next) => {
  // Supprimer tous les paramètres liés au mode d'auth des requêtes
  delete req.query.authMode;
  delete req.body.authMode;
  delete req.params.authMode;
  
  // Nettoyer les headers suspects
  const suspiciousHeaders = ['x-auth-mode', 'x-force-auth', 'x-bypass-auth'];
  suspiciousHeaders.forEach(header => {
    delete req.headers[header];
  });
  
  next();
};

/**
 * 🚫 Middleware anti-injection XSS
 */
export const xssProtection = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    return value;
  };
  
  // Nettoyer les paramètres de requête
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitizeValue(req.query[key]);
    });
  }
  
  // Nettoyer le body (sauf pour les fichiers)
  if (req.body && req.headers['content-type'] !== 'multipart/form-data') {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitizeValue(req.body[key]);
    });
  }
  
  next();
};

/**
 * 🔐 Middleware de validation du mode d'authentification
 */
export const validateAuthMode = (req, res, next) => {
  // Le mode d'auth est TOUJOURS déterminé par la configuration serveur
  req.authMode = SECURITY_CONFIG.AUTH_MODE;
  
  // Log des tentatives de manipulation
  if (req.headers['x-requested-auth-mode'] && 
      req.headers['x-requested-auth-mode'] !== SECURITY_CONFIG.AUTH_MODE) {
    console.warn(`🚨 Tentative de manipulation du mode d'auth détectée:`, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      requestedMode: req.headers['x-requested-auth-mode'],
      actualMode: SECURITY_CONFIG.AUTH_MODE,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};
