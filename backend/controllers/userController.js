// backend/controllers/userController.js
import User from '../models/User.js';
import Avis from '../models/Avis.js';
import { Op } from 'sequelize';

/**
 * 🔐Obtenir le profil de l'utilisateur connecté (patient ou médecin)
 */
export const getProfile = async (req, res) => {
  try {
    // Vérification rapide de la DB
    try {
      await User.sequelize.authenticate();
    } catch (dbError) {
      return res.status(503).json({ 
        success: false, 
        message: 'Base de données indisponible',
        error: 'SERVICE_UNAVAILABLE'
      });
    }

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
      'accepte_non_traitants', 'horaires_travail', 'accessibilite',
      // Nouveaux champs pour le profil médecin amélioré
      'email_visible', 'telephone_visible', 'tarifs', 'consultation_duree',
      'urgences_acceptees', 'teleconsultation', 'presentation_detaillee',
      'formation_continue', 'associations_professionnelles', 'certifications',
      'faq',
      // Nouveaux champs pour le profil patient amélioré
      'antecedents_familiaux', 'traitements_actuels', 'chirurgies',
      'hospitalisations', 'personne_a_contacter', 'telephone_urgence',
      'medecin_traitant_externe', 'preferences_soins', 'contraintes_medicales',
      'notes_personnelles', 'donnees_visibles_medecins', 'autoriser_recherche_medecins',
      'partage_urgences'
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
  console.log('📡 Route GET /api/users/doctors appelée');
  try {
    const medecins = await User.findAll({
      where: { role: 'medecin' },
      attributes: [
        'id', 'prenom', 'nom', 'specialite', 'etablissements', 'photo_profil',
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

export const getPublicMedecinProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user ? req.user.userId : null; // Récupérer l'ID de l'utilisateur connecté si disponible
    
    console.log('🔍 Recherche du médecin avec ID:', id);
    console.log('👤 Utilisateur connecté:', userId);
    
    const medecin = await User.findOne({
      where: { id, role: 'medecin' },
      attributes: [
        'id', 'prenom', 'nom', 'photo_profil', 'specialite', 'etablissements',
        'adresse', 'description', 'langues', 'diplome', 'parcours_professionnel',
        'horaires_travail', 'accessibilite', 'accepte_nouveaux_patients',
        'moyens_paiement', 'email', 'telephone', 'date_creation',
        'accepte_non_traitants'
      ]
    });
    
    if (!medecin) {
      console.log('❌ Médecin non trouvé pour ID:', id);
      return res.status(404).json({ 
        success: false, 
        message: "Médecin introuvable" 
      });
    }

    console.log('✅ Médecin trouvé:', medecin.prenom, medecin.nom);

    // Vérifier si l'utilisateur connecté est déjà un patient de ce médecin
    let estDejaPatient = false;
    if (userId) {
      // Chercher dans la table des demandes de médecin traitant acceptées
      const { DemandeTraitant } = await import('../models/DemandeTraitant.js');
      const demande = await DemandeTraitant.findOne({
        where: {
          patient_id: userId,
          medecin_id: id,
          statut: 'accepte'
        }
      });
      estDejaPatient = !!demande;
      console.log('🔗 Est déjà patient de ce médecin:', estDejaPatient);
    }

    // Version simplifiée sans les avis pour le moment
    const profileData = {
      ...medecin.toJSON(),
      // Calcul de l'expérience (années depuis création du compte)
      experience_annees: new Date().getFullYear() - new Date(medecin.date_creation).getFullYear(),
      // Statut de disponibilité
      statut_disponibilite: medecin.accepte_nouveaux_patients ? 'Disponible' : 'Complet',
      // Avis par défaut (vides pour le moment)
      avis: [],
      note_moyenne: null,
      nombre_avis: 0,
      // Informations de contact sécurisées (par défaut visibles)
      email_visible: true,
      telephone_visible: true,
      // Champs manquants avec valeurs par défaut
      tarifs: 'Non renseigné',
      faq: [], // Tableau vide au lieu d'une chaîne
      // Nouvelle info : est déjà patient
      est_deja_patient: estDejaPatient
    };

    console.log('📤 Envoi des données du profil');
    res.json({ success: true, data: profileData });
  } catch (error) {
    console.error('❌ Erreur getPublicMedecinProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération du profil" 
    });
  }
};

/**
 * 🌐 Obtenir le profil public d'un patient
 */
export const getPublicPatientProfile = async (req, res) => {
  try {
    console.log('🚀 getPublicPatientProfile APPELÉ - params:', req.params);
    
    const patientId = req.params.id;
    
    console.log('🔍 Recherche du patient avec ID:', patientId);
    
    const patient = await User.findOne({
      where: { id: patientId, role: 'patient' },
      attributes: [
        'id', 'nom', 'prenom', 'email', 'photo_profil',
        'date_naissance', 'ville', 'langue_preferee', 'created_at'
      ]
    });
    
    if (!patient) {
      console.log('❌ Patient non trouvé');
      return res.status(404).json({ 
        success: false, 
        message: "Patient non trouvé" 
      });
    }
    
    // Données publiques limitées pour respecter la confidentialité
    const publicData = {
      id: patient.id,
      nom: patient.nom,
      prenom: patient.prenom,
      photo_profil: patient.photo_profil,
      langue_preferee: patient.langue_preferee,
      created_at: patient.created_at,
      // Informations conditionnelles (selon paramètres de confidentialité)
      date_naissance: patient.date_naissance, // Pour calculer l'âge
      ville: patient.ville,
      // Note: email et autres infos sensibles ne sont pas exposées par défaut
    };
    
    console.log('📤 Envoi des données publiques du patient');
    res.json({ success: true, data: publicData });
  } catch (error) {
    console.error('❌ Erreur getPublicPatientProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération du profil public" 
    });
  }
};
