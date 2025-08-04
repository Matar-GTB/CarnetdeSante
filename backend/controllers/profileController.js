// backend/controllers/profileController.js
import User from '../models/User.js';
import AccessLog from '../models/AccessLog.js';
import DemandeTraitant from '../models/DemandeTraitant.js';

/**
 * 🔐 Obtenir le profil complet de l'utilisateur connecté (patient ou médecin)
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`📋 Récupération du profil pour l'utilisateur ${userId}`);

    const user = await User.findByPk(userId, {
      attributes: { 
        exclude: ['mot_de_passe', 'token_reinitialisation', 'expiration_token_reinitialisation'] 
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    const profileData = {
      // Données de base
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      date_naissance: user.date_naissance,
      sexe: user.sexe,
      adresse: user.adresse,
      photo_profil: user.photo_profil,

      // Données médicales
      groupe_sanguin: user.groupe_sanguin,
      allergies: user.allergies,
      antecedents_medicaux: user.antecedents_medicaux,
      traitements_actuels: user.traitements_actuels,

      // Données biométriques
      poids: user.poids,
      taille: user.taille,
      electrophorese: user.electrophorese,
      numero_secu: user.numero_secu,

      // Contacts d'urgence
      contact_urgence: user.contact_urgence,
      personne_urgence: user.personne_urgence,

      // Champs spécifiques aux médecins
      numero_ordre: user.numero_ordre,
      specialite: user.specialite,
      sous_specialites: user.sous_specialites,
      etablissements: user.etablissements,
      adresse_cabinet: user.adresse_cabinet,
      telephone_cabinet: user.telephone_cabinet,
      diplome: user.diplome,
      parcours_professionnel: user.parcours_professionnel,
      langues: user.langues,
      moyens_paiement: user.moyens_paiement,
      description: user.description,
      accepte_nouveaux_patients: user.accepte_nouveaux_patients,
      accepte_non_traitants: user.accepte_non_traitants,
      horaires_travail: user.horaires_travail,
      jours_disponibles: user.jours_disponibles,
      duree_consultation: user.duree_consultation,
      teleconsultation: user.teleconsultation,
      accessibilite: user.accessibilite,
      tarifs: user.tarifs,
      faq: user.faq,
      profil_public: user.profil_public,
      visible_recherche: user.visible_recherche,
      afficher_avis: user.afficher_avis,

      // Préférences (structure unifiée)
      langue_preferee: user.langue_preferee,
      preferences_notifications: user.preferences_notifications,

      // Visibilité et création
      visibility_settings: user.visibility_settings || {},
      date_creation: user.date_creation,
      est_verifie: user.est_verifie
    };

    await AccessLog.create({
      utilisateur_id: userId,
      type_action: 'consultation',
      type_cible: 'profil',
      id_cible: userId,
      adresse_ip: req.ip
    });

    res.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * ✏️ Mettre à jour le profil de l'utilisateur connecté
 */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body.profile || req.body;

    console.log('🔍 Champs reçus dans updateData :', updateData);

    // Champs non autorisés
    delete updateData.id;
    delete updateData.email;
    delete updateData.role;
    delete updateData.mot_de_passe;
    delete updateData.date_creation;
    delete updateData.derniere_connexion;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // 🔐 Mettre à jour tous les champs fournis (y compris les valeurs vides pour permettre l'effacement)
    Object.keys(updateData).forEach(key => {
      // Permettre les valeurs vides et null pour l'effacement de champs
      // Seulement exclure les valeurs undefined
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
        console.log(`📝 Mise à jour ${key}: "${updateData[key]}"`);
      }
    });

    await user.save();

    // Log
    await AccessLog.create({
      utilisateur_id: userId,
      type_action: 'modification',
      type_cible: 'profil',
      id_cible: userId,
      adresse_ip: req.ip
    });

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['mot_de_passe', 'token_reinitialisation', 'expiration_token_reinitialisation'] }
    });

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: updatedUser
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
;

/**
 * 🔒 Mettre à jour les paramètres de visibilité du profil
 */
export const updateVisibilitySettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { visibilitySettings } = req.body;
    
    console.log(`👁️ Mise à jour des paramètres de visibilité pour l'utilisateur ${userId}`);

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Mise à jour des paramètres de visibilité
    await user.update({
      visibility_settings: visibilitySettings
    });

    // Log de la modification
    await AccessLog.create({
      utilisateur_id: userId,
      type_action: 'modification',
      type_cible: 'visibilite',
      id_cible: userId,
      adresse_ip: req.ip
    });

    res.json({
      success: true,
      message: 'Paramètres de visibilité mis à jour avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des paramètres de visibilité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres de visibilité',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 👁️ Récupérer les paramètres de visibilité actuels
 */
export const getVisibilitySettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'visibility_settings']
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({
      success: true,
      data: user.visibility_settings || {}
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des paramètres de visibilité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres de visibilité',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 🚨 Générer un lien d'urgence sécurisé
 */
export const generateEmergencyLink = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { durationHours = 24 } = req.body;
    
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les patients peuvent générer des liens d\'urgence'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Générer un token unique
    const emergencyToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + (durationHours * 60 * 60 * 1000));

    // Sauvegarder le token d'urgence
    await user.update({
      emergency_token: emergencyToken,
      emergency_token_expires: expiresAt
    });

    // Log de la génération du lien
    await AccessLog.create({
      utilisateur_id: userId,
      type_action: 'partage',
      type_cible: 'urgence',
      id_cible: userId,
      adresse_ip: req.ip
    });

    const emergencyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/emergency/${userId}/${emergencyToken}`;

    res.json({
      success: true,
      data: {
        token: emergencyToken,
        url: emergencyUrl,
        expires_at: expiresAt
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la génération du lien d\'urgence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du lien d\'urgence',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 🚨 Récupérer le profil d'urgence via un token
 */
export const getEmergencyProfile = async (req, res) => {
  try {
    const { patientId, token } = req.params;
    
    console.log(`🚨 Accès d'urgence demandé pour le patient ${patientId}`);

    const user = await User.findOne({
      where: {
        id: patientId,
        emergency_token: token
      },
      attributes: [
        'id', 'prenom', 'nom', 'date_naissance', 'groupe_sanguin',
        'allergies', 'antecedents_medicaux', 'traitements_actuels',
        'contact_urgence', 'personne_urgence', 'emergency_token_expires'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Lien d\'urgence invalide ou expiré'
      });
    }

    // Vérifier l'expiration
    if (user.emergency_token_expires && new Date() > user.emergency_token_expires) {
      return res.status(401).json({
        success: false,
        message: 'Lien d\'urgence expiré'
      });
    }

    // Log de l'accès d'urgence
    await AccessLog.create({
      utilisateur_id: patientId,
      type_action: 'consultation',
      type_cible: 'urgence',
      id_cible: patientId,
      adresse_ip: req.ip
    });

    res.json({
      success: true,
      data: {
        ...user.toJSON(),
        emergency_token_expires: undefined // Ne pas exposer la date d'expiration
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'accès d\'urgence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'accès d\'urgence',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * ❌ Révoquer un lien d'urgence
 */
export const revokeEmergencyLink = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Révoquer le token d'urgence
    await user.update({
      emergency_token: null,
      emergency_token_expires: null
    });

    // Log de la révocation
    await AccessLog.create({
      utilisateur_id: userId,
      type_action: 'modification',
      type_cible: 'urgence',
      id_cible: userId,
      adresse_ip: req.ip
    });

    res.json({
      success: true,
      message: 'Lien d\'urgence révoqué avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la révocation du lien d\'urgence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la révocation du lien d\'urgence',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 📊 Récupérer les statistiques du profil
 */
export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'patient') {
      // Statistiques pour un patient
      const accessLogs = await AccessLog.count({
        where: { utilisateur_id: userId }
      });

      stats = {
        total_access: accessLogs,
        profile_views: await AccessLog.count({
          where: { 
            utilisateur_id: userId,
            type_action: 'consultation',
            type_cible: 'profil'
          }
        }),
        emergency_access: await AccessLog.count({
          where: { 
            utilisateur_id: userId,
            type_action: 'consultation',
            type_cible: 'urgence'
          }
        })
      };
    } else if (userRole === 'medecin') {
      // Statistiques pour un médecin
      stats = {
        profile_views: await AccessLog.count({
          where: { 
            utilisateur_id: userId,
            type_action: 'consultation',
            type_cible: 'profil'
          }
        })
      };
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    const requesterId = req.user?.id; // ID de l'utilisateur qui fait la demande
    
    console.log('🔍 Recherche du patient avec ID:', patientId);
    console.log('👤 Demandeur:', requesterId || 'Non authentifié');
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'ID patient manquant'
      });
    }
    
    const patient = await User.findOne({
      where: { 
        id: patientId, 
        role: 'patient'
      },
      attributes: [
        'id', 'nom', 'prenom', 'email', 'photo_profil',
        'date_naissance', 'ville', 'langue_preferee', 'date_creation',
        'visibility_settings', 'email_public', 'telephone_public',
        'groupe_sanguin', 'allergies', 'medecin_traitant_id'
      ]
    });
    
    if (!patient) {
      console.log('❌ Patient non trouvé');
      return res.status(404).json({ 
        success: false, 
        message: "Patient non trouvé" 
      });
    }
    
    // Vérifier si l'utilisateur qui fait la requête est un médecin traitant de ce patient
    const isTreatingDoctor = requesterId && await DemandeTraitant.findOne({
      where: {
        medecin_id: requesterId,
        patient_id: patientId,
        statut: 'accepte'
      }
    });
    
    // Données de base toujours publiques
    const publicData = {
      id: patient.id,
      nom: patient.nom,
      prenom: patient.prenom,
      photo_profil: patient.photo_profil,
      langue_preferee: patient.langue_preferee,
      date_creation: patient.date_creation,
      date_naissance: patient.date_naissance,
      ville: patient.ville,
      visibilite: patient.visibility_settings || {},
      is_my_patient: !!isTreatingDoctor
    };
    
    // Informations conditionnelles selon les paramètres de visibilité
    if (patient.email_public) {
      publicData.email = patient.email;
    }
    
    if (patient.telephone_public) {
      publicData.telephone = patient.telephone;
    }
    
    // Si c'est un médecin traitant du patient, ajouter plus d'informations
    if (isTreatingDoctor) {
      publicData.groupe_sanguin = patient.groupe_sanguin;
      publicData.allergies = patient.allergies;
    }
    
    // Si le patient a un médecin traitant et que celui-ci est visible publiquement
    if (patient.medecin_traitant_id) {
      const medecinTraitant = await User.findOne({
        where: { id: patient.medecin_traitant_id },
        attributes: ['id', 'nom', 'prenom', 'specialite', 'etablissement']
      });
      
      if (medecinTraitant) {
        publicData.medecin_traitant = {
          ...medecinTraitant.toJSON(),
          visible_public: true // À ajuster selon les paramètres du médecin
        };
      }
    }
    
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