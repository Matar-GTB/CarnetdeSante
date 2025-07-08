import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AccessLog from '../models/AccessLog.js';

/**
 * 🔐 Middleware de base : vérifie le token JWT
 */
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || (decoded.tokenVersion && user.tokenVersion !== decoded.tokenVersion)) {
      return res.status(403).json({ error: 'Token invalide' });
    }

    req.user = {
      userId: user.id,
      role: user.role,
      nom_complet: `${user.prenom} ${user.nom}`
    };

    next();
  } catch (err) {
    console.error('Erreur JWT:', err);
    return res.status(403).json({ error: 'Token expiré ou invalide' });
  }
};

/**
 * 🔐📝 Middleware avec journalisation des accès (RGPD + tracking)
 */
export const authWithLogging = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requis' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) return res.status(403).json({ error: 'Utilisateur invalide' });

    // Log RGPD
    await AccessLog.create({
      utilisateur_id: user.id,
      type_action: 'consultation',
      type_cible: 'middleware',
      id_cible: 0,
      adresse_ip: req.ip
    });

    req.user = {
      userId: user.id,
      role: user.role,
      nom_complet: `${user.prenom} ${user.nom}`
    };

    next();
  } catch (err) {
    console.error('authWithLogging -> JWT error:', err);
    res.status(403).json({ error: 'Accès refusé ou session expirée' });
  }
};