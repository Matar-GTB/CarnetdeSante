// backend/config/security.js - Configuration sécurisée centralisée
export const SECURITY_CONFIG = {
  // Mode d'authentification : ne doit JAMAIS être modifiable côté client
  AUTH_MODE: process.env.AUTH_MODE || 'traditional', // 'traditional' | 'cookies' | 'dual'
  
  // Configuration des cookies sécurisés
  COOKIE_CONFIG: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
    path: '/',
    maxAge: {
      access: 15 * 60 * 1000, // 15 minutes
      refresh: 7 * 24 * 60 * 60 * 1000 // 7 jours
    }
  },
  
  // Headers de sécurité
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': process.env.NODE_ENV === 'production' 
      ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
      : "default-src 'self' 'unsafe-eval'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  },
  
  // Validation des tokens
  JWT_CONFIG: {
    secret: process.env.JWT_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production');
      }
      return 'dev_secret_not_for_production';
    })(),
    expiresIn: '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_REFRESH_SECRET must be set in production');
      }
      return 'dev_refresh_secret_not_for_production';
    })(),
    refreshExpiresIn: '7d'
  },
  
  // Rate limiting
  RATE_LIMITS: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 tentatives max
      message: 'Trop de tentatives de connexion'
    },
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // 100 requêtes max
    }
  }
};
