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
      teleconsultation: user.teleconsultation,
      accessibilite: user.accessibilite,
      tarifs: user.tarifs,
      faq: user.faq,
      visible_recherche: user.visible_recherche,
      afficher_avis: user.afficher_avis,

      // Préférences (structure unifiée)
      langue_preferee: user.langue_preferee,
      preferences_notifications: user.preferences_notifications,

      // Visibilité et création
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
        'id', 'nom', 'prenom', 'email', 'photo_profil', 'telephone',
        'date_naissance', 'adresse', 'langue_preferee', 'date_creation',
        'groupe_sanguin', 'allergies',
        'contact_urgence', 'personne_urgence'
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
    
    // Exposer tous les champs du patient (lecture seule, plus de filtrage visibilité)
    console.log('📤 Envoi des données publiques du patient');
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error('❌ Erreur getPublicPatientProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération du profil public" 
    });
  }
};

/**
 * 🌐 Obtenir le profil public d'un médecin
 */
export const getPublicMedecinProfile = async (req, res) => {
  try {
    const medecinId = req.params.id;
    const requesterId = req.user?.id; // ID de l'utilisateur qui fait la demande (optionnel)

    if (!medecinId) {
      return res.status(400).json({
        success: false,
        message: 'ID médecin manquant'
      });
    }

    const medecin = await User.findOne({
      where: {
        id: medecinId,
        role: 'medecin'
      },
      attributes: [
        'id', 'nom', 'prenom', 'email', 'telephone', 'role', 'date_naissance', 'sexe', 'adresse', 'photo_profil',
        'numero_ordre', 'specialite', 'sous_specialites', 'etablissements', 'adresse_cabinet', 'telephone_cabinet',
        'diplome', 'parcours_professionnel', 'langues', 'moyens_paiement', 'description',
        'accepte_nouveaux_patients', 'accepte_non_traitants', 'horaires_travail', 'jours_disponibles',
        'teleconsultation', 'accessibilite', 'tarifs', 'faq', 'visible_recherche', 'afficher_avis',
        'langue_preferee', 'preferences_notifications',  'date_creation', 'est_verifie',
        'tokenVersion', 'token_reinitialisation', 'expiration_token_reinitialisation',
        'emergency_token', 'emergency_token_expires',
        'nom_complet'
      ]
    });

    if (!medecin) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }



    // Exposer tous les champs du médecin (lecture seule, plus de filtrage visibilité)
    res.json({ success: true, data: medecin });
  } catch (error) {
    console.error('❌ Erreur getPublicMedecinProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil public du médecin'
    });
  }
};