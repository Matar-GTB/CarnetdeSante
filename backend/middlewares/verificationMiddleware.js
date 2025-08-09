// backend/middlewares/verificationMiddleware.js
import User from '../models/User.js';
import { logWarning } from '../utils/logger.js';

/**
 * Middleware pour vérifier si l'utilisateur a bien vérifié son email et/ou son numéro de téléphone
 * avant d'accéder à certaines fonctionnalités sensibles
 */
export const verificationRequiredMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentification requise'
      });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Par défaut, on vérifie que l'email est vérifié
    if (!user.email_verified) {
      logWarning(`Tentative d'accès par utilisateur non vérifié (ID: ${userId})`);
      return res.status(403).json({
        success: false,
        message: 'Vérification de l\'email requise',
        code: 'EMAIL_VERIFICATION_REQUIRED',
        redirectUrl: '/auth/verification-pending'
      });
    }
    
    // Si l'utilisateur a fourni un numéro de téléphone, on vérifie également qu'il est vérifié
    // (uniquement pour les fonctionnalités sensibles qui nécessitent une authentification forte)
    if (req.requirePhoneVerification && user.telephone && !user.telephone_verified) {
      return res.status(403).json({
        success: false,
        message: 'Vérification du téléphone requise',
        code: 'PHONE_VERIFICATION_REQUIRED',
        redirectUrl: '/auth/verification-pending'
      });
    }
    
    // Si tout est en ordre, on continue
    next();
  } catch (error) {
    console.error('❌ Erreur dans verificationMiddleware:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la vérification du statut de l\'utilisateur'
    });
  }
};

/**
 * Middleware pour les routes nécessitant une vérification forte (email ET téléphone si disponible)
 * Utile pour les fonctionnalités sensibles comme la gestion des partages, des profils médicaux, etc.
 */
export const strongVerificationRequired = (req, res, next) => {
  req.requirePhoneVerification = true;
  verificationRequiredMiddleware(req, res, next);
};

/**
 * Middleware pour les routes nécessitant uniquement la vérification de l'email
 */
export const emailVerificationRequired = (req, res, next) => {
  req.requirePhoneVerification = false;
  verificationRequiredMiddleware(req, res, next);
};

export default emailVerificationRequired;
