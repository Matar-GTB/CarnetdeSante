// backend/routes/configRoutes.js - Routes de configuration sécurisées
import express from 'express';
import { SECURITY_CONFIG } from '../config/security.js';
import { securityMiddleware, preventAuthModeInjection } from '../middlewares/securityMiddleware.js';

const router = express.Router();

// Appliquer les middlewares de sécurité
router.use(securityMiddleware);
router.use(preventAuthModeInjection);

/**
 * 🔒 Endpoint sécurisé pour la configuration d'authentification
 * GET /api/auth/config
 */
router.get('/config', (req, res) => {
  // Log de la demande de configuration
  console.log(`🔒 Demande de configuration auth depuis ${req.ip}`);
  
  // Retourner UNIQUEMENT les informations nécessaires
  const publicConfig = {
    authMode: SECURITY_CONFIG.AUTH_MODE,
    // Ne jamais exposer les secrets ou configurations sensibles
    features: {
      cookiesSupported: SECURITY_CONFIG.AUTH_MODE === 'cookies' || SECURITY_CONFIG.AUTH_MODE === 'dual',
      traditionalSupported: SECURITY_CONFIG.AUTH_MODE === 'traditional' || SECURITY_CONFIG.AUTH_MODE === 'dual'
    },
    security: {
      // Informations publiques de sécurité
      httpsRequired: process.env.NODE_ENV === 'production',
      cookieSecure: SECURITY_CONFIG.COOKIE_CONFIG.secure
    }
  };
  
  res.json(publicConfig);
});

/**
 * 🛡️ Endpoint pour vérifier la sécurité de la session
 * GET /api/auth/security-check
 */
router.get('/security-check', (req, res) => {
  const securityCheck = {
    timestamp: new Date().toISOString(),
    secureConnection: req.secure || req.headers['x-forwarded-proto'] === 'https',
    authMode: SECURITY_CONFIG.AUTH_MODE,
    headers: {
      userAgent: req.headers['user-agent'] ? 'present' : 'missing',
      origin: req.headers.origin || 'not-set'
    }
  };
  
  res.json(securityCheck);
});

export default router;
