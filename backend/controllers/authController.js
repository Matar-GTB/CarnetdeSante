// backend/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const RESET_TOKEN_EXPIRATION = 60 * 60 * 1000; // 1h
const SALT_ROUNDS = 12;

/**
 *  Connexion utilisateur
 */
export const login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe) return res.status(400).json({ message: 'Email et mot de passe requis' });

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.verifyPassword(mot_de_passe))) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = generateToken({
  userId: user.id,
  role: user.role,
  prenom: user.prenom,
  nom: user.nom
});

    res.json({
  id: user.id,
  email: user.email,
  role: user.role,
  nom: user.nom,
  prenom: user.prenom,
  adresse: user.adresse,
  telephone: user.telephone,
  sexe: user.sexe,
  date_naissance: user.date_naissance,
  specialite: user.specialite,
  langues: user.langues,
  moyens_paiement: user.moyens_paiement,
  accepte_nouveaux_patient: user.accepte_nouveaux_patient,
  accepte_non_traitants: user.accepte_non_traitants,
  horaires_travail: user.horaires_travail,
  accessibilite: user.accessibilite,
  photo_profil: user.photo_profil,
  token
});

  } catch (err) {
    handleError(res, err, 'Erreur lors de la connexion');
  }
};

/**
 * Inscription utilisateur
 */
export const register = async (req, res) => {
  try {
    const { email, mot_de_passe, role, ...data } = req.body;

    if (!email || !mot_de_passe) return res.status(400).json({ message: 'Email et mot de passe requis' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email déjà utilisé' });

    const user = await User.create({
      email,
      mot_de_passe,
      role: role || 'patient',
      ...data
    });

    const token = generateToken({
  userId: user.id,
  role: user.role,
  prenom: user.prenom,
  nom: user.nom
});

    res.status(201).json({
  id: user.id,
  email: user.email,
  role: user.role,
  nom: user.nom,
  prenom: user.prenom,
  adresse: user.adresse,
  telephone: user.telephone,
  sexe: user.sexe,
  date_naissance: user.date_naissance,
  specialite: user.specialite,
  langues: user.langues,
  moyens_paiement: user.moyens_paiement,
  accepte_nouveaux_patient: user.accepte_nouveaux_patient,
  accepte_non_traitants: user.accepte_non_traitants,
  horaires_travail: user.horaires_travail,
  accessibilite: user.accessibilite,
  photo_profil: user.photo_profil,
  token
});

  } catch (err) {
    handleError(res, err, 'Erreur lors de l’inscription');
  }
};

/**
 * 🛠 Envoi du token de réinitialisation
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis' });

    const user = await User.findOne({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiration = new Date(Date.now() + RESET_TOKEN_EXPIRATION);

      await user.update({
        token_reinitialisation: token,
        expiration_token_reinitialisation: expiration
      });

      sendPasswordResetEmail(user.email, token);
    }

    res.json({ message: 'Si votre email est valide, un lien a été envoyé' });
  } catch (err) {
    handleError(res, err, 'Erreur lors de la demande de réinitialisation');
  }
};

/**
 * 🔍 Vérification du token de réinitialisation
 */
export const validateResetToken = async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({
      where: {
        token_reinitialisation: token,
        expiration_token_reinitialisation: { [Op.gt]: new Date() }
      }
    });

    if (!user) return res.status(400).json({ message: 'Token invalide ou expiré' });
    res.json({ message: 'Token valide' });
  } catch (err) {
    handleError(res, err, 'Erreur lors de la validation du token');
  }
};

/**
 *  Réinitialisation du mot de passe
 */
export const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ message: 'Mot de passe invalide (min. 8 caractères)' });

    const user = await User.findOne({
      where: {
        token_reinitialisation: token,
        expiration_token_reinitialisation: { [Op.gt]: new Date() }
      }
    });

    if (!user) return res.status(400).json({ message: 'Token invalide ou expiré' });

    user.mot_de_passe = newPassword;
    user.token_reinitialisation = null;
    user.expiration_token_reinitialisation = null;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    handleError(res, err, 'Erreur lors de la réinitialisation');
  }
};

/**
 *  Génère un token JWT
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 *  Simule l'envoi d'un mail de réinitialisation
 */
function sendPasswordResetEmail(email, token) {
  console.log(`[Reset] Mail à ${email}: ${(process.env.CLIENT_URL || 'http://localhost:3000')}/reset-password/${token}`);
}

/**
 *  Gestion centralisée des erreurs
 */
function handleError(res, err, context = 'Erreur') {
  console.error(err);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Erreur serveur'
      : `${context}: ${err.message}`
  });
}