// backend/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import User from '../models/User.js';
import HorairesTravail from '../models/HorairesTravail.js';
import { sendVerificationEmail, sendVerificationCode } from '../services/emailService.js';
import { generateOTP, sendOTPBySMS } from '../services/smsService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = 12;

// 🔐 Génération du token d'accès
function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function handleError(res, err, context = 'Erreur') {
  console.error(err);
  res.status(500).json({ message: `${context}: ${err.message}` });
}

// Cette fonction est maintenant dans le service emailService.js

export const login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    
    if (!email || !mot_de_passe)
      return res.status(400).json({ message: 'Email et mot de passe requis' });

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    const isPasswordValid = await user.verifyPassword(mot_de_passe);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
      
    // Vérifier si l'email est vérifié - BLOCAGE STRICT
    if (!user.email_verified) {
      // Générer un nouveau code de vérification pour faciliter le processus
      const newCode = generateOTP();
      user.otp = newCode;
      user.otp_expiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await user.save();
      
      // Tenter d'envoyer un nouveau code
      try {
        await sendVerificationCode(user.email, user.prenom || 'Utilisateur', newCode);
        console.log(`✅ Nouveau code de vérification envoyé à ${user.email} lors de la tentative de connexion`);
      } catch (emailError) {
        console.error('❌ Erreur lors de l\'envoi du code de vérification:', emailError);
      }
      
      return res.status(403).json({
        success: false,
        message: 'Votre compte n\'est pas activé. Un nouveau code de vérification a été envoyé à votre adresse email.',
        code: 'EMAIL_VERIFICATION_REQUIRED',
        redirectUrl: '/auth/verification-pending',
        user: {
          id: user.id,
          email: user.email
        }
      });
    }

    // Token d'accès court (15 minutes)
    const accessToken = generateToken({
      userId: user.id,
      role: user.role,
      prenom: user.prenom,
      nom: user.nom
    }, '15m');

    // Token de refresh long (7 jours)
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'refresh_dev',
      { expiresIn: '7d' }
    );

    // Configuration sécurisée des cookies HttpOnly
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
      path: '/'
    };

    // Cookie pour le token d'accès (15 minutes)
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Cookie pour le token de refresh (7 jours)
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    // Réponse sans token dans le body (seulement les infos utilisateur)
    const userResponse = { ...user.toJSON() };
    delete userResponse.mot_de_passe;
    
    res.json({ 
      success: true,
      user: userResponse,
      message: 'Connexion réussie'
    });
  } catch (err) {
    handleError(res, err, 'Erreur lors de la connexion');
  }
};

export const register = async (req, res) => {
  try {
    const { email, mot_de_passe, role = 'patient', telephone, ...data } = req.body;

    if (!email || !mot_de_passe)
      return res.status(400).json({ message: 'Email et mot de passe requis' });

    // Vérifier la complexité du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(mot_de_passe)) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
      });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(409).json({ message: 'Email déjà utilisé' });

    // Configuration des préférences de notification
    const prefs_notification = {
      email: true,
      sms: telephone ? true : false
    };

    const user = await User.create({ 
      email, 
      mot_de_passe, 
      role, 
      telephone,
      email_verified: false,
      telephone_verified: false,
      prefs_notification,
      ...data 
    });
    
    // Génération d'un code de vérification numérique (6 chiffres)
    const emailCode = generateOTP();
    user.otp = emailCode;
    user.otp_expiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    // Envoyer email avec le code de vérification
    try {
      await sendVerificationCode(user.email, user.prenom || 'Utilisateur', emailCode);
      console.log(`✅ Email avec code de vérification envoyé à ${user.email}`);
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi du code de vérification par email:', emailError);
    }

    // Envoyer SMS de vérification si numéro fourni
    if (telephone) {
      const otp = generateOTP();
      user.otp = otp;
      user.otp_expiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await user.save();
      
      try {
        await sendOTPBySMS(telephone, otp);
        console.log(`✅ SMS de vérification envoyé à ${telephone}`);
      } catch (smsError) {
        console.error('❌ Erreur lors de l\'envoi du SMS de vérification:', smsError);
      }
    }

    if (role === 'medecin') {
      const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
      const horairesPromises = jours.map(jour =>
        HorairesTravail.create({
          medecin_id: user.id,
          jour_semaine: jour,
          heure_debut: '08:00',
          heure_fin: '16:00',
          duree_creneau: 30
        })
      );
      await Promise.all(horairesPromises);
    }

    // Token d'accès court pour l'inscription
    const accessToken = generateToken({
      userId: user.id,
      role: user.role,
      prenom: user.prenom,
      nom: user.nom
    }, '15m');

    // Token de refresh pour l'inscription
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'refresh_dev',
      { expiresIn: '7d' }
    );

    // Configuration des cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
      path: '/'
    };

    // Définir les cookies
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    const userResponse = { ...user.toJSON() };
    delete userResponse.mot_de_passe;

    res.status(201).json({ 
      success: true,
      user: userResponse,
      requireVerification: true,
      message: 'Pré-inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
      redirectUrl: '/auth/verification-pending'
    });
  } catch (err) {
    handleError(res, err, 'Erreur lors de l’inscription');
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Token de refresh manquant' });
    }

    // Vérification du refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_dev');
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ message: 'Type de token invalide' });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(403).json({ message: 'Utilisateur introuvable' });
    }

    // Générer un nouveau token d'accès
    const newAccessToken = generateToken({
      userId: user.id,
      role: user.role,
      prenom: user.prenom,
      nom: user.nom
    }, '15m');

    // Configuration des cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
      path: '/'
    };

    // Nouveau cookie d'accès
    res.cookie('accessToken', newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Optionnel : renouveler aussi le refresh token pour une sécurité accrue
    const newRefreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'refresh_dev',
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    res.json({ 
      success: true,
      user: {
        id: user.id,
        role: user.role,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email
      },
      message: 'Token renouvelé avec succès'
    });
  } catch (err) {
    // Effacer les cookies en cas d'erreur
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    handleError(res, err, 'Erreur lors du renouvellement du token');
  }
};

export const logout = (req, res) => {
  // Configuration des cookies pour la suppression
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
    path: '/'
  };

  // Supprimer les deux cookies
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  
  res.json({ 
    success: true,
    message: 'Déconnecté avec succès' 
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + RESET_TOKEN_EXPIRATION);

    user.token_reinitialisation = token;
    user.expiration_token_reinitialisation = expiration;
    await user.save();

    sendPasswordResetEmail(user.email, token);
    res.json({ message: 'Email de réinitialisation envoyé' });

  } catch (err) {
    handleError(res, err, 'Erreur lors de la demande de réinitialisation');
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { nouveau_mot_de_passe } = req.body;

    if (!nouveau_mot_de_passe) {
      return res.status(400).json({ message: 'Le nouveau mot de passe est requis' });
    }

    const user = await User.findOne({
      where: {
        token_reinitialisation: token,
        expiration_token_reinitialisation: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Lien de réinitialisation invalide ou expiré' });
    }

    // Laisser le hook beforeSave du modèle User hasher le mot de passe
    // Ne pas hasher ici pour éviter le double hachage
    user.mot_de_passe = nouveau_mot_de_passe;
    user.token_reinitialisation = null;
    user.expiration_token_reinitialisation = null;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    handleError(res, err, 'Erreur lors de la réinitialisation du mot de passe');
  }
};
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        token_reinitialisation: token,
        expiration_token_reinitialisation: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    res.json({ message: 'Token valide' });
  } catch (err) {
    handleError(res, err, 'Erreur lors de la validation du token');
  }
};

/**
 * Vérifie l'email de l'utilisateur avec un code numérique
 */
export const verifyEmailWithCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et code de vérification requis' 
      });
    }

    const user = await User.findOne({ 
      where: { 
        email,
        otp: code,
        otp_expiration: { [Op.gt]: new Date() }
      } 
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code invalide ou expiré' 
      });
    }

    // Marquer l'email comme vérifié
    user.email_verified = true;
    user.otp = null;
    user.otp_expiration = null;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Email vérifié avec succès',
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_verified
      }
    });
  } catch (err) {
    handleError(res, err, 'Erreur lors de la vérification du code');
  }
};

/**
 * Renvoie un nouveau code de vérification par email
 */
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email requis' 
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    if (user.email_verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email déjà vérifié' 
      });
    }

    // Génération d'un nouveau code de vérification
    const newCode = generateOTP();
    user.otp = newCode;
    user.otp_expiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    // Envoi du nouveau code par email
    try {
      await sendVerificationCode(user.email, user.prenom || 'Utilisateur', newCode);
      
      res.json({ 
        success: true, 
        message: 'Nouveau code de vérification envoyé' 
      });
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi du nouveau code de vérification:', emailError);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'envoi du code de vérification' 
      });
    }
  } catch (err) {
    handleError(res, err, 'Erreur lors du renvoi du code de vérification');
  }
};
