import { Op } from 'sequelize';
import Document from '../models/Document.js';
import DocumentPartage from '../models/DocumentPartage.js';

/**
 * ✅ Middleware générique de vérification de rôle
 * @param {Array} roles - Rôles autorisés
 */
export const checkRole = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Utilisateur non authentifié" });

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: "Accès refusé. Rôle insuffisant",
      attendu: roles,
      actuel: req.user.role
    });
  }

  next();
};

/**
 * 🔄 Vérifie si l'utilisateur accède à son propre profil ou son patient
 */
export const patientOrMedecin = async (req, res, next) => {
  const targetUserId = parseInt(req.params.userId);
  const userId = req.user.userId;

  if (!req.user) return res.status(401).json({ error: 'Authentification requise' });

  const isSelf = targetUserId === userId;

  // ⚠ Optionnel : logiques avancées de lien médecin-patient
  const isMedecin = req.user.role === 'medecin';
  // const isOwnPatient = await ... (à définir si tu implémentes les relations patient-traitant)

  if (req.user.role !== 'admin' && !isSelf /* && !isOwnPatient */) {
    return res.status(403).json({ error: 'Accès non autorisé à ce profil' });
  }

  next();
};

/**
 * 📁 Vérifie l’accès à un document médical partagé ou appartenant à l'utilisateur
 */
export const documentAccess = async (req, res, next) => {
  const documentId = parseInt(req.params.id);
  const userId = req.user.userId;
  const isAdmin = req.user.role === 'admin';

  try {
    const document = await Document.findByPk(documentId);

    if (!document) {
      return res.status(404).json({ error: "Document non trouvé" });
    }

    // Accès direct si propriétaire ou admin
    if (document.utilisateur_id === userId || isAdmin) {
      return next();
    }

    // Sinon vérifier s'il a été partagé
    const shared = await DocumentPartage.findOne({
      where: {
        partage_id: { [Op.not]: null }, // Idéalement à relier à un partage actif
        document_id: documentId
      }
    });

    if (!shared) {
      return res.status(403).json({ error: "Accès au document non autorisé" });
    }

    next();
  } catch (error) {
    console.error('Erreur accès document :', error);
    res.status(500).json({ error: 'Erreur interne serveur' });
  }
};