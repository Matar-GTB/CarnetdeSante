// backend/routes/passwordRoutes.js
import express from 'express';
import { 
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
  changePassword
} from '../controllers/passwordController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques pour la réinitialisation
router.post('/forgot', requestPasswordReset);
router.get('/reset/verify/:token', verifyResetToken);
router.post('/reset/:token', resetPassword);

// Route protégée pour le changement de mot de passe
router.post('/change', authMiddleware, changePassword);

export default router;
