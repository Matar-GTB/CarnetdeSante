// backend/config/jwt.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Génération d'un secret par défaut sécurisé si non fourni dans .env
const DEFAULT_SECRET = crypto.randomBytes(64).toString('hex');
export const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;

// Durée de validité configurable (par défaut 2h)
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

// Options supplémentaires pour renforcer la sécurité
const JWT_OPTIONS = {
  expiresIn: JWT_EXPIRES_IN,
  algorithm: 'HS256',
  issuer: 'carnet-sante-api',
  audience: 'carnet-sante-app'
};

/**
 * Génère un token JWT sécurisé
 * @param {Object} payload - Données à inclure dans le token
 * @param {string} [expiresIn] - Durée de validité optionnelle
 * @returns {string} Token JWT signé
 */
export const generateToken = (payload, expiresIn = null) => {
  const options = expiresIn 
    ? { ...JWT_OPTIONS, expiresIn } 
    : JWT_OPTIONS;

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Token à vérifier
 * @returns {Object} Payload décodé
 * @throws {Error} Si la vérification échoue
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: JWT_OPTIONS.issuer,
    audience: JWT_OPTIONS.audience
  });
};

/**
 * Rafraîchit un token expiré mais valide
 * @param {string} token - Token expiré
 * @param {string} [expiresIn] - Nouvelle durée de validité
 * @returns {string} Nouveau token
 */
export const refreshToken = (token, expiresIn = null) => {
  const payload = verifyToken(token);
  return generateToken(payload, expiresIn);
};

// Avertissement en développement si on utilise le secret par défaut
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ Attention: Utilisation d\'un secret JWT par défaut!');
  console.warn('⚠️ Définissez JWT_SECRET dans votre .env pour la production');
}