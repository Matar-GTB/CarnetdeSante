// backend/controllers/passwordController.js
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../services/emailService.js';

const SALT_ROUNDS = 12;
const RESET_TOKEN_EXPIRATION = 3600000; // 1 heure en millisecondes

/**
 * Gestion des erreurs
 */
function handleError(res, err, context = 'Erreur') {
  console.error(`❌ ${context}:`, err);
  res.status(500).json({ message: `${context}: ${err.message}` });
}

/**
 * Initialise une demande de réinitialisation de mot de passe
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
      return res.json({ 
        success: true,
        message: 'Si votre email est dans notre base, vous recevrez un lien de réinitialisation' 
      });
    }

    // Générer un token de réinitialisation
    const token = crypto.randomBytes(32).toString('hex');
    user.token_reinitialisation = token;
    user.expiration_token_reinitialisation = new Date(Date.now() + RESET_TOKEN_EXPIRATION);
    await user.save();

    // Envoyer l'email
    await sendPasswordResetEmail(user.email, user.prenom || 'Utilisateur', token);

    res.json({ 
      success: true,
      message: 'Si votre email est dans notre base, vous recevrez un lien de réinitialisation' 
    });
  } catch (err) {
    handleError(res, err, 'Erreur lors de la demande de réinitialisation');
  }
};

/**
 * Validation du token de réinitialisation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("Token reçu pour vérification:", token);

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token requis' 
      });
    }

    const user = await User.findOne({
      where: {
        token_reinitialisation: token,
        expiration_token_reinitialisation: { [Op.gt]: new Date() }
      }
    });

    console.log("Utilisateur trouvé:", user ? "Oui" : "Non");
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Token invalide ou expiré' 
      });
    }

    console.log("Réponse envoyée pour token valide:", user.email);
    res.json({ 
      success: true,
      message: 'Token valide',
      email: user.email
    });
  } catch (err) {
    handleError(res, err, 'Erreur lors de la validation du token');
  }
};

/**
 * Réinitialisation du mot de passe
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("Token reçu pour réinitialisation:", token);
    const { nouveau_mot_de_passe, confirmation_mot_de_passe } = req.body;

    if (!nouveau_mot_de_passe || !confirmation_mot_de_passe) {
      return res.status(400).json({ 
        message: 'Nouveau mot de passe et confirmation requis' 
      });
    }

    if (nouveau_mot_de_passe !== confirmation_mot_de_passe) {
      return res.status(400).json({ 
        message: 'Le mot de passe et sa confirmation ne correspondent pas' 
      });
    }

    // Vérifier la complexité du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(nouveau_mot_de_passe)) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
      });
    }

    const user = await User.findOne({
      where: {
        token_reinitialisation: token,
        expiration_token_reinitialisation: { [Op.gt]: new Date() }
      }
    });

    console.log("Utilisateur trouvé pour réinitialisation:", user ? "Oui" : "Non");
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Token invalide ou expiré' 
      });
    }

    // Laisser le hook beforeSave du modèle User hasher le mot de passe
    // Ne pas hasher ici pour éviter le double hachage
    user.mot_de_passe = nouveau_mot_de_passe;
    user.token_reinitialisation = null;
    user.expiration_token_reinitialisation = null;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalider les sessions existantes
    await user.save();

    // Envoyer un email de confirmation
    try {
      await sendPasswordChangedEmail(user.email, user.prenom || 'Utilisateur');
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
    }

    res.json({ 
      success: true,
      message: 'Mot de passe réinitialisé avec succès' 
    });
  } catch (err) {
    handleError(res, err, 'Erreur lors de la réinitialisation du mot de passe');
  }
};

/**
 * Changement de mot de passe pour un utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId; // Provient du middleware d'authentification
    const { ancien_mot_de_passe, nouveau_mot_de_passe, confirmation_mot_de_passe } = req.body;

    if (!ancien_mot_de_passe || !nouveau_mot_de_passe || !confirmation_mot_de_passe) {
      return res.status(400).json({ 
        message: 'Tous les champs sont requis' 
      });
    }

    if (nouveau_mot_de_passe !== confirmation_mot_de_passe) {
      return res.status(400).json({ 
        message: 'Le nouveau mot de passe et sa confirmation ne correspondent pas' 
      });
    }

    // Vérifier la complexité du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(nouveau_mot_de_passe)) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier l'ancien mot de passe
    const isPasswordValid = await user.verifyPassword(ancien_mot_de_passe);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    if (ancien_mot_de_passe === nouveau_mot_de_passe) {
      return res.status(400).json({ 
        message: 'Le nouveau mot de passe doit être différent de l\'ancien' 
      });
    }

    // Laisser le hook beforeSave du modèle User hasher le mot de passe
    // Ne pas hasher ici pour éviter le double hachage
    user.mot_de_passe = nouveau_mot_de_passe;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalider les sessions existantes
    await user.save();

    // Envoyer un email de confirmation
    try {
      await sendPasswordChangedEmail(user.email, user.prenom || 'Utilisateur');
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
    }

    res.json({ 
      success: true,
      message: 'Mot de passe modifié avec succès' 
    });
  } catch (err) {
    handleError(res, err, 'Erreur lors du changement de mot de passe');
  }
};


