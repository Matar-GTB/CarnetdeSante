// backend/routes/verificationRoutes.js
import express from 'express';
import { 
  sendVerificationEmailToUser, 
  verifyEmail,
  sendPhoneVerification,
  verifyOTP,
  checkVerificationStatus
} from '../controllers/verificationsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.post('/email/send', sendVerificationEmailToUser);
router.get('/email/verify/:token', verifyEmail);
router.post('/phone/verify', verifyOTP); // Peut être utilisé sans auth pour vérification initiale

// Routes protégées (nécessitent une authentification)
router.post('/phone/send', authMiddleware, sendPhoneVerification);
router.get('/status', authMiddleware, checkVerificationStatus);

export default router;
