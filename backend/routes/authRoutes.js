import express from 'express';
import {
  login,
  register,
  forgotPassword,
  validateResetToken,
  resetPassword,
  refreshAccessToken,
  logout
} from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);

// 🍪 Route pour vérifier le statut d'authentification (cookies)
router.get('/status', authMiddleware, (req, res) => {
  console.log('🍪 req.user:', req.user); // Debug pour voir les propriétés disponibles
  
  res.json({
    success: true,
    message: 'Utilisateur authentifié',
    data: {
      id: req.user.id,
      prenom: req.user.prenom || req.user.firstName,
      nom: req.user.nom || req.user.lastName || req.user.name,
      email: req.user.email,
      role: req.user.role,
      nom_complet: `${req.user.prenom || req.user.firstName || ''} ${req.user.nom || req.user.lastName || req.user.name || ''}`.trim() || 'Utilisateur'
    }
  });
});

export default router;