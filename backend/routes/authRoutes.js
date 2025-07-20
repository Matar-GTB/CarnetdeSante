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

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);

export default router;