import express from 'express';
import {
  login,
  register,
  forgotPassword,
  validateResetToken,
  resetPassword,
  refreshAccessToken,
  logout,
  verifyEmailWithCode,
  resendVerificationCode
} from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { emailVerificationRequired } from '../middlewares/verificationMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);

// Routes de vérification par code
router.post('/verify-email-code', verifyEmailWithCode);
router.post('/resend-verification-code', resendVerificationCode);

// 🍪 Route pour vérifier le statut d'authentification (cookies)
router.get('/status', authMiddleware, async (req, res) => {
  try {
    console.log('🍪 req.user:', req.user); // Debug pour voir les propriétés disponibles
    
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Utilisateur authentifié',
      data: {
        id: req.user.userId,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified,
        telephone_verified: user.telephone_verified,
        nom_complet: `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut'
    });
  }
});

export default router;