import express from 'express';
import {
  login,
  register,
  forgotPassword,
  validateResetToken,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);

export default router;