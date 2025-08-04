// backend/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import User from '../models/User.js';
import HorairesTravail from '../models/HorairesTravail.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const RESET_TOKEN_EXPIRATION = 60 * 60 * 1000; // 1h
const SALT_ROUNDS = 12;

// 🔐 Génération du token d'accès
function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function handleError(res, err, context = 'Erreur') {
  console.error(err);
  res.status(500).json({ message: `${context}: ${err.message}` });
}

function sendPasswordResetEmail(email, token) {
  const resetURL = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${token}`;
  console.log(`[Reset] Mail à ${email}: ${resetURL}`);
}

export const login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe)
      return res.status(400).json({ message: 'Email et mot de passe requis' });

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.verifyPassword(mot_de_passe)))
      return res.status(401).json({ message: 'Identifiants invalides' });

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
    const { email, mot_de_passe, role = 'patient', ...data } = req.body;

    if (!email || !mot_de_passe)
      return res.status(400).json({ message: 'Email et mot de passe requis' });

    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(409).json({ message: 'Email déjà utilisé' });

    const user = await User.create({ email, mot_de_passe, role, ...data });

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
      message: 'Inscription réussie'
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

    user.mot_de_passe = await bcrypt.hash(nouveau_mot_de_passe, SALT_ROUNDS);
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
