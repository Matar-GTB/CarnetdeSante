// backend/routes/mailRoutes.js
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendReminderEmail,
  sendVerificationCode
} from '../services/emailService.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @route POST /mail/send
 * @desc Envoie un email général
 * @access Private - Nécessite authentification
 */
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    
    // Vérification de sécurité - seul un admin ou un utilisateur s'envoyant un email à lui-même est autorisé
    const user = req.user;
    if (user.role !== 'admin' && user.email !== to) {
      return res.status(403).json({ 
        success: false, 
        message: 'Non autorisé à envoyer des emails à d\'autres utilisateurs'
      });
    }

    // Construction d'un email simple
    const transporter = (await import('../services/emailService.js')).default.transporter;
    
    const mailOptions = {
      from: `"CarnetdeSante" <${process.env.EMAIL_FROM || 'noreply@carnetsante.com'}>`,
      to,
      subject,
      text
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email envoyé depuis l\'API:', info.messageId);
    
    res.json({ 
      success: true, 
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email via l\'API:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email'
    });
  }
});

export default router;
