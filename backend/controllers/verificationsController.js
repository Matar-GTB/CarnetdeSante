// backend/controllers/verificationsController.js
import { Op } from 'sequelize';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendVerificationEmail } from '../services/emailService.js';
import { generateOTP, sendOTPBySMS } from '../services/smsService.js';

/**
 * Gestion des erreurs
 */
function handleError(res, err, context = 'Erreur') {
  console.error(`❌ ${context}:`, err);
  res.status(500).json({ message: `${context}: ${err.message}` });
}

/**
 * Génère et envoie un email de vérification
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const sendVerificationEmailToUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }

    // Vérifier si l'email existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.email_verified) {
      return res.status(400).json({ message: 'Cet email est déjà vérifié' });
    }

    // Générer un token de vérification
    const token = crypto.randomBytes(20).toString('hex');
    user.token_verification_email = token;
    user.expiration_token_verification_email = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await user.save();

    // Envoyer l'email
    await sendVerificationEmail(user.email, user.prenom || 'Utilisateur', token);

    return res.status(200).json({
      success: true,
      message: 'Email de vérification envoyé avec succès',
    });
  } catch (error) {
    handleError(res, error, 'Erreur lors de l\'envoi de l\'email de vérification');
  }
};

/**
 * Envoie un code OTP par SMS pour vérification
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const sendPhoneVerification = async (req, res) => {
  try {
    const { telephone } = req.body;
    const userId = req.userId; // Provient du middleware d'authentification

    if (!telephone) {
      return res.status(400).json({ message: 'Numéro de téléphone requis' });
    }

    // Si l'utilisateur est connecté, utiliser son ID
    let user;
    if (userId) {
      user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      
      // Mise à jour du numéro si différent
      if (user.telephone !== telephone) {
        user.telephone = telephone;
        user.telephone_verified = false;
        await user.save();
      }
    } else {
      // Sinon, chercher par numéro de téléphone
      user = await User.findOne({ where: { telephone } });
      
      if (!user) {
        return res.status(404).json({ message: 'Aucun utilisateur avec ce numéro' });
      }
    }

    // Si déjà vérifié
    if (user.telephone_verified) {
      return res.status(400).json({ message: 'Téléphone déjà vérifié' });
    }

    // Générer un code OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otp_expiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    // Envoyer le SMS
    await sendOTPBySMS(telephone, otp);

    return res.status(200).json({
      success: true,
      message: 'Code de vérification envoyé par SMS'
    });
  } catch (error) {
    handleError(res, error, 'Erreur lors de l\'envoi du SMS de vérification');
  }
};

/**
 * Vérification de l'email via le token envoyé par email
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: 'Token de vérification manquant' });
    }
    
    const user = await User.findOne({
      where: {
        token_verification_email: token,
        expiration_token_verification_email: { [Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }
    
    // Marquer l'email comme vérifié
    user.email_verified = true;
    user.email_verified_at = new Date();  // Ajout d'un timestamp pour les métriques
    user.token_verification_email = null;
    user.expiration_token_verification_email = null;
    await user.save();
    
    // Enregistrer la métrique de vérification d'email
    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { default: MetricsService } = await import('../services/metricsService.js');
      await MetricsService.recordEmailVerification(user.id);
    } catch (metricError) {
      console.error('❌ Erreur lors de l\'enregistrement de la métrique:', metricError);
      // On ne bloque pas la vérification si l'enregistrement de la métrique échoue
    }
    
    res.json({ 
      success: true,
      message: 'Adresse email vérifiée avec succès' 
    });
  } catch (error) {
    handleError(res, error, 'Erreur lors de la vérification de l\'email');
  }
};

/**
 * Vérifier le code OTP reçu par SMS
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const verifyOTP = async (req, res) => {
  try {
    const { otp, telephone } = req.body;
    const userId = req.userId; // Optionnel, si authentifié

    if (!otp) {
      return res.status(400).json({ message: 'Code OTP requis' });
    }

    // Récupérer l'utilisateur (par ID ou téléphone)
    let user;
    if (userId) {
      user = await User.findByPk(userId);
    } else if (telephone) {
      user = await User.findOne({ where: { telephone } });
    } else {
      return res.status(400).json({ message: 'Identifiant utilisateur requis' });
    }

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (!user.otp || !user.otp_expiration) {
      return res.status(400).json({ message: 'Aucun code OTP n\'a été généré' });
    }

    if (new Date() > user.otp_expiration) {
      return res.status(400).json({ message: 'Le code OTP a expiré' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Code OTP invalide' });
    }

    // Marquer le téléphone comme vérifié
    user.telephone_verified = true;
    user.otp = null;
    user.otp_expiration = null;
    await user.save();

    res.json({
      success: true,
      message: 'Numéro de téléphone vérifié avec succès'
    });
  } catch (error) {
    handleError(res, error, 'Erreur lors de la vérification du code OTP');
  }
};

/**
 * Vérifier le statut de vérification de l'utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const checkVerificationStatus = async (req, res) => {
  try {
    const userId = req.userId; // Provient du middleware d'authentification

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      status: {
        email_verified: user.email_verified,
        telephone_verified: user.telephone ? user.telephone_verified : null,
        telephone: user.telephone || null
      }
    });
  } catch (error) {
    handleError(res, error, 'Erreur lors de la vérification du statut');
  }
};
