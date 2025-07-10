// backend/controllers/userController.js
import User from '../models/User.js';
import { Op } from 'sequelize';

/**
 * 🔐 Obtenir le profil de l'utilisateur connecté (patient ou médecin)
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['mot_de_passe', 'token_reinitialisation', 'expiration_token_reinitialisation'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    handleServerError(res, error, 'Erreur lors de la récupération du profil');
  }
};

/**
 * ✏ Mettre à jour les infos personnelles autorisées
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const allowedFields = [
      'prenom', 'nom', 'telephone', 'sexe', 'date_naissance',
      'groupe_sanguin', 'adresse', 'photo_profil', 'allergies',
      'antecedents_medicaux', 'langues', 'specialite',
      'etablissements', 'diplome', 'parcours_professionnel',
      'moyens_paiement', 'description', 'accepte_nouveaux_patients',
      'accepte_non_traitants', 'horaires_travail', 'accessibilite'
    ];

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        user[key] = req.body[key];
      }
    }

    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    handleServerError(res, error, 'Erreur lors de la mise à jour du profil');
  }
};

/**
 * 🌍 Obtenir tous les médecins visibles publiquement
 */
export const getAllDoctors = async (req, res) => {
  try {
    const medecins = await User.findAll({
      where: { role: 'medecin' },
      attributes: [
        'id', 'prenom', 'nom', 'specialite', 'photo_profil',
        'description', 'adresse', 'langues', 'accepte_nouveaux_patients'
      ]
    });

    res.json({ success: true, data: medecins });
  } catch (error) {
    handleServerError(res, error, 'Erreur lors de la récupération des médecins');
  }
};

/**
 * 🔍 Détails publics d’un médecin
 */
export const getDoctorDetails = async (req, res) => {
  try {
    const doctor = await User.findOne({
      where: {
        id: req.params.id,
        role: 'medecin'
      },
      attributes: {
        exclude: ['mot_de_passe', 'token_reinitialisation', 'expiration_token_reinitialisation']
      }
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Médecin non trouvé' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    handleServerError(res, error, 'Erreur lors de la récupération du médecin');
  }
};

/**
 * 🧠 Recherche filtrée de médecins (nom, spécialité, langue, ville, accepte_nouveaux_patients)
 */
export const searchDoctors = async (req, res) => {
  try {
    const { nom, specialite, ville, langue, accepte } = req.query;

    const where = {
      role: 'medecin',
      ...(nom && {
        [Op.or]: [
          { nom: { [Op.iLike]: `%${nom}%` } },
          { prenom: { [Op.iLike]: `%${nom}%` } }
        ]
      }),
      ...(specialite && { specialite: { [Op.iLike]: `%${specialite}%`} }),
      ...(ville && { adresse: { [Op.iLike]: `%${ville}% `} }),
      ...(langue && { langues: { [Op.iLike]: `%${langue}%` } }),
      ...(accepte && { accepte_nouveaux_patients: true })
    };

    const result = await User.findAll({
      where,
      attributes: [
        'id', 'prenom', 'nom', 'specialite', 'adresse',
        'photo_profil', 'langues', 'accepte_nouveaux_patients'
      ]
    });

    res.json({ success: true, data: result });
  } catch (error) {
    handleServerError(res, error, 'Erreur lors de la recherche des médecins');
  }
};

/**
 * ⚠ Fonction utilitaire de gestion d'erreurs
 */
function handleServerError(res, error, defaultMessage) {
  console.error(error);
  const message = process.env.NODE_ENV === 'production'
    ? 'Erreur serveur'
    : `${defaultMessage}: ${error.message}`;

  res.status(500).json({ success: false, message });
}

export const updateProfileWithPhoto = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const updateData = req.body;

    if (req.file) {
      updateData.photo_profil = `/uploads/profiles/${req.file.filename}`;
    }

    await user.update(updateData);
    res.json({ success: true, message: "Profil mis à jour", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour du profil avec photo" });
  }
};

