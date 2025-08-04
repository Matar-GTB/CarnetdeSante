// backend/controllers/traitantController.js
import DemandeTraitant from '../models/DemandeTraitant.js';
import User            from '../models/User.js';
import { Op }          from 'sequelize';

/**
 * POST /api/traitants/request
 * Le patient envoie une demande de médecin traitant
 */
export const createDemandeTraitant = async (req, res) => {
  try {
    // 1) Seulement un patient peut créer une demande
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const patient_id   = req.user.userId;
    const { medecin_id, message_demande } = req.body;

    // 2) Vérifier que le médecin existe et est bien un médecin
    const medecin = await User.findOne({ where: { id: medecin_id, role: 'medecin' } });
    if (!medecin) {
      return res.status(404).json({ success: false, message: "Médecin introuvable" });
    }

    // 3) Pas de doublon de demande en attente ou acceptée
    const exists = await DemandeTraitant.findOne({
      where: {
        patient_id,
        medecin_id,
        statut: { [Op.in]: ['en_attente', 'accepte'] }
      }
    });
    if (exists) {
      return res.status(409).json({ success: false, message: "Vous avez déjà une demande en cours ou un médecin traitant enregistré" });
    }

    // 4) Création de la demande
    const demande = await DemandeTraitant.create({
      patient_id,
      medecin_id,
      message_demande: message_demande || null,
      statut: 'en_attente'
    });

    return res.status(201).json({ success: true, data: demande });
  } catch (err) {
    console.error("createDemandeTraitant:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * GET /api/traitants/requests
 * Le patient liste toutes ses demandes (en_attente, accepte, refuse)
 */
export const getDemandeTraitantByPatient = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const patient_id = req.user.userId;
    const demandes = await DemandeTraitant.findAll({
      where: { patient_id },
      include: [{
        model: User,
        as: 'Medecin',
        attributes: ['id', 'prenom', 'nom', 'photo_profil', 'specialite', 'etablissements', 'langues']
      }],
      order: [['statut', 'ASC'], ['date_creation', 'DESC']]
    });

    return res.json({ success: true, data: demandes });
  } catch (err) {
    console.error("getDemandeTraitantByPatient:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * GET /api/traitants/patients
 * Le médecin liste tous les patients qui l'ont accepté comme traitant
 */
export const getPatientsByMedecin = async (req, res) => {
  try {
    if (req.user.role !== 'medecin') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const medecin_id = req.user.userId;
    const demandes = await DemandeTraitant.findAll({
      where: {
        medecin_id,
        statut: 'accepte'
      },
      include: [{
        model: User,
        as: 'Patient',
        attributes: [
          'id', 'prenom', 'nom', 'email', 'telephone', 
          'date_naissance', 'sexe', 'groupe_sanguin', 'photo_profil',
          'allergies', 'antecedents_medicaux', 'traitements_actuels',
          'contact_urgence', 'personne_urgence', 'adresse'
        ]
      }],
      order: [['date_creation', 'DESC']]
    });

    const patients = demandes.map(d => {
      const patient = d.Patient;
      if (!patient) return null;
      
      // Calculer l'âge si date_naissance disponible
      let age = null;
      if (patient.date_naissance) {
        const today = new Date();
        const birthDate = new Date(patient.date_naissance);
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      return {
        ...patient.toJSON(),
        age,
        derniere_consultation: d.date_creation, // Pour l'instant, on utilise la date d'acceptation
        relation_depuis: d.date_creation,
        statut_relation: d.statut
      };
    }).filter(p => p !== null);
    
    return res.json({ success: true, data: patients });
  } catch (err) {
    console.error("getPatientsByMedecin:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
/**
 * GET /api/traitants/mes-traitants
 * Le patient récupère ses médecins traitants (acceptés uniquement)
 */
export const getMesTraitants = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }
    const patient_id = req.user.userId;
    // On va chercher toutes les demandes acceptées côté patient
    const demandes = await DemandeTraitant.findAll({
      where: {
        patient_id,
        statut: 'accepte'
      },
      include: [{
        model: User,
        as: 'Medecin',
        attributes: ['id', 'prenom', 'nom', 'specialite', 'etablissements', 'langues', 'photo_profil']
      }]
    });
    // On map pour ne retourner que les infos utiles du médecin
    const medecins = demandes
      .map(d => d.Medecin)
      .filter(m => !!m); // Sécurité
    return res.json({ success: true, data: medecins });
  } catch (err) {
    console.error("getMesTraitants:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * DELETE /api/traitants/request/:id
 * Le patient annule sa demande de médecin traitant
 */
export const cancelDemandeTraitant = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }
    const demande = await DemandeTraitant.findOne({
      where: { id: req.params.id, patient_id: req.user.userId }
    });
    if (!demande) {
      return res.status(404).json({ success: false, message: "Demande introuvable" });
    }
    if (demande.statut !== 'en_attente') {
      return res.status(400).json({ success: false, message: "Seules les demandes en attente peuvent être annulées" });
    }
    await demande.destroy();
    return res.json({ success: true, message: "Demande annulée" });
  } catch (err) {
    console.error("cancelDemandeTraitant:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * GET /api/traitants/demandes
 * Le médecin récupère toutes les demandes en attente pour lui
 */
export const getDemandesPourMedecin = async (req, res) => {
  try {
    if (req.user.role !== 'medecin') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const medecin_id = req.user.userId;
    const demandes = await DemandeTraitant.findAll({
      where: {
        medecin_id,
        statut: 'en_attente'
      },
      include: [{
        model: User,
        as: 'Patient',
        attributes: ['id', 'prenom', 'nom', 'email', 'date_naissance', 'photo_profil']
      }],
      order: [['date_creation', 'DESC']]
    });

    return res.json({ success: true, data: demandes });
  } catch (err) {
    console.error("getDemandesPourMedecin:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * PUT /api/traitants/demandes/:id/repondre
 * Le médecin accepte ou refuse une demande
 */
export const repondreDemandeTraitant = async (req, res) => {
  try {
    if (req.user.role !== 'medecin') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const { statut, message_reponse } = req.body;
    const medecin_id = req.user.userId;

    if (!['accepte', 'refuse'].includes(statut)) {
      return res.status(400).json({ success: false, message: "Statut invalide" });
    }

    const demande = await DemandeTraitant.findOne({
      where: {
        id: req.params.id,
        medecin_id,
        statut: 'en_attente'
      }
    });

    if (!demande) {
      return res.status(404).json({ success: false, message: "Demande introuvable" });
    }

    await demande.update({
      statut,
      message_reponse: message_reponse || null,
      date_mise_a_jour: new Date()
    });

    return res.json({ success: true, data: demande });
  } catch (err) {
    console.error("repondreDemandeTraitant:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * GET /api/traitants/patient/:id/profile
 * Le médecin récupère le profil complet d'un de ses patients
 */
export const getPatientProfile = async (req, res) => {
  try {
    if (req.user.role !== 'medecin') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const medecin_id = req.user.userId;
    const patient_id = req.params.id;

    // Vérifier que ce patient est bien un patient du médecin connecté
    const relation = await DemandeTraitant.findOne({
      where: {
        patient_id,
        medecin_id,
        statut: 'accepte'
      }
    });

    if (!relation) {
      return res.status(403).json({ 
        success: false, 
        message: "Vous n'êtes pas autorisé à consulter ce profil" 
      });
    }

    // Récupérer le profil complet du patient
    const patient = await User.findOne({
      where: { 
        id: patient_id, 
        role: 'patient' 
      },
      attributes: [
        'id', 'prenom', 'nom', 'email', 'telephone', 
        'sexe', 'date_naissance', 'groupe_sanguin', 
        'adresse', 'photo_profil', 'allergies', 
        'antecedents_medicaux', 'date_creation'
      ]
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient introuvable" });
    }

    return res.json({ success: true, data: patient });
  } catch (err) {
    console.error("getPatientProfile:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * GET /api/traitants/mes-autres-demandes
 * Le patient récupère ses demandes en attente ou refusées
 */

/**
 * DELETE /api/traitants/remove/:medecinId
 * Le patient supprime un médecin traitant accepté
 */
export const removeTraitant = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const patient_id = req.user.userId;
    const medecin_id = req.params.medecinId;

    // Trouver et supprimer la relation traitant acceptée
    const deleted = await DemandeTraitant.destroy({
      where: {
        patient_id,
        medecin_id,
        statut: 'accepte'
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Relation médecin traitant introuvable" 
      });
    }

    return res.json({ 
      success: true, 
      message: "Médecin traitant supprimé avec succès" 
    });
  } catch (err) {
    console.error("removeTraitant:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * PUT /api/traitants/set-principal/:medecinId
 * Le patient définit un médecin comme traitant principal
 */
export const setTraitantPrincipal = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const patient_id = req.user.userId;
    const medecin_id = req.params.medecinId;

    // D'abord, supprimer le statut principal de tous les autres traitants
    await DemandeTraitant.update(
      { is_traitant_principal: false },
      {
        where: {
          patient_id,
          statut: 'accepte'
        }
      }
    );

    // Ensuite, définir le nouveau traitant principal
    const [updated] = await DemandeTraitant.update(
      { is_traitant_principal: true },
      {
        where: {
          patient_id,
          medecin_id,
          statut: 'accepte'
        }
      }
    );

    if (updated === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Médecin traitant introuvable" 
      });
    }

    return res.json({ 
      success: true, 
      message: "Médecin traitant principal défini avec succès" 
    });
  } catch (err) {
    console.error("setTraitantPrincipal:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
/**
 * DELETE /api/traitants/patients/:patientId
 * Le médecin supprime un patient de sa liste
 */
/**
 * DELETE /api/traitants/patients/:patientId
 * Le médecin supprime un patient de sa liste
 */
export const removePatientRelation = async (req, res) => {
  if (req.user.role !== 'medecin') {
    return res.status(403).json({ success: false, message: "Accès refusé" });
  }

  const medecin_id = req.user.userId;
  const patient_id = parseInt(req.params.patientId);

  try {
    const deleted = await DemandeTraitant.destroy({
      where: {
        medecin_id,
        patient_id,
        statut: 'accepte'
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ success: false, message: "Relation introuvable ou déjà supprimée." });
    }

    return res.status(200).json({ success: true, message: "Relation supprimée avec succès." });
  } catch (err) {
    console.error("Erreur suppression relation médecin-patient :", err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};
