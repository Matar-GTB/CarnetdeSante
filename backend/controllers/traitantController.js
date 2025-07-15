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
        attributes: ['id', 'prenom', 'nom', 'specialite', 'etablissements']
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
        attributes: ['id', 'prenom', 'nom', 'email', 'date_naissance']
      }]
    });

    const patients = demandes.map(d => d.Patient);
    return res.json({ success: true, data: patients });
  } catch (err) {
    console.error("getPatientsByMedecin:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
