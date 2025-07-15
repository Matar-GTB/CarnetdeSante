// backend/controllers/appointmentController.js

import Appointment from '../models/Appointment.js';
import DemandeTraitant from '../models/DemandeTraitant.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { Op } from 'sequelize';

/**
 * 1) Créer une demande de RDV (statut = 'en_attente')
 */
export const createAppointment = async (req, res) => {
  try {
    const {
      patient_id,
      medecin_id,
      date_rendezvous,
      heure_debut,
      heure_fin,
      type_rendezvous,
      notes
    } = req.body;

    // Sécurité : un patient ne peut créer que pour lui-même
    if (req.user.role === 'patient' && patient_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Accès interdit' });
    }

    // Validation simple
    if (heure_fin <= heure_debut) {
      return res
        .status(400)
        .json({ success: false, message: 'L’heure de fin doit être après l’heure de début' });
    }

    const newAppt = await Appointment.create({
      patient_id,
      medecin_id,
      date_rendezvous,
      heure_debut,
      heure_fin,
      type_rendezvous,
      notes
    });

    return res.status(201).json({ success: true, data: newAppt });
  } catch (error) {
    console.error('Erreur création RDV:', error);
    return res
      .status(500)
      .json({ success: false, message: `Erreur création RDV : ${error.message}` });
  }
};

/**
 * 2) Le médecin accepte la demande → statut passe à 'planifie' + détection de conflit
 */
export const acceptAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: 'RDV non trouvé' });
    }
    if (req.user.userId !== appt.medecin_id) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    // Conflit sur créneaux déjà planifiés
    const conflict = await Appointment.findOne({
      where: {
        medecin_id: appt.medecin_id,
        date_rendezvous: appt.date_rendezvous,
        statut: 'planifie',
        [Op.or]: [
          { heure_debut: { [Op.between]: [appt.heure_debut, appt.heure_fin] } },
          { heure_fin:   { [Op.between]: [appt.heure_debut, appt.heure_fin] } },
          {
            [Op.and]: [
              { heure_debut: { [Op.lte]: appt.heure_debut } },
              { heure_fin:   { [Op.gte]: appt.heure_fin } }
            ]
          }
        ]
      }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Conflit : Dr ${req.user.nom_complet} a déjà un RDV de ${conflict.heure_debut} à ${conflict.heure_fin}`
      });
    }

    appt.statut = 'planifie';
    await appt.save();

    // Notifier le patient
    await Notification.create({
      utilisateur_id: appt.patient_id,
      type_notification: 'rendezvous',
      titre: 'RDV confirmé',
      message: `Votre RDV du ${appt.date_rendezvous} à ${appt.heure_debut} a été confirmé.`,
      est_lu: false
    });

    return res.json({ success: true, data: appt });
  } catch (error) {
    console.error('Erreur acceptation RDV:', error);
    return res
      .status(500)
      .json({ success: false, message: `Erreur acceptation RDV : ${error.message}` });
  }
};

/**
 * 3) Récupérer la liste des médecins traitants pour le patient connecté
 */
export const getMedecinsTraitants = async (req, res) => {
  try {
    const demandes = await DemandeTraitant.findAll({
      where: { patient_id: req.user.userId, statut: 'accepte' },
      include: [
        {
          model: User,
          as: 'Medecin',
          attributes: ['id', 'prenom', 'nom', 'specialite', 'etablissements']
        }
      ]
    });

    const medecins = demandes.map((d) => d.Medecin);
    return res.json({ success: true, data: medecins });
  } catch (error) {
    console.error('Erreur récupération traitants :', error);
    return res
      .status(500)
      .json({ success: false, message: 'Erreur récupération médecins traitants' });
  }
};

/**
 * 4) Récupérer tous les médecins disponibles
 */
export const getMedecinsDisponibles = async (req, res) => {
  try {
    const medecins = await User.findAll({
      where: { role: 'medecin' },
      attributes: ['id', 'prenom', 'nom', 'specialite', 'langues', 'etablissements']
    });
    return res.json({ success: true, data: medecins });
  } catch (error) {
    console.error('Erreur récupération médecins disponibles :', error);
    return res
      .status(500)
      .json({ success: false, message: 'Erreur récupération médecins disponibles' });
  }
};

/**
 * 5) Récupérer les RDV d’un utilisateur (patient ou médecin)
 */
export const getAppointmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const appts = await Appointment.findAll({
      where: {
        [Op.or]: [{ patient_id: userId }, { medecin_id: userId }]
      },
      include: [
        { model: User, as: 'Patient', attributes: ['id', 'prenom', 'nom'] },
        { model: User, as: 'Medecin', attributes: ['id', 'prenom', 'nom', 'specialite'] }
      ],
      order: [
        ['date_rendezvous', 'ASC'],
        ['heure_debut', 'ASC']
      ]
    });
    return res.json({ success: true, data: appts });
  } catch (error) {
    console.error('Erreur récupération RDV :', error);
    return res
      .status(500)
      .json({ success: false, message: `Erreur récupération RDV : ${error.message}` });
  }
};

/**
 * 6) Supprimer un RDV
 */
export const deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: 'RDV non trouvé' });
    }
    const isOwner =
      req.user.userId === appt.patient_id || req.user.userId === appt.medecin_id;
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await appt.destroy();
    return res.json({ success: true, message: 'RDV supprimé' });
  } catch (error) {
    console.error('Erreur suppression RDV :', error);
    return res
      .status(500)
      .json({ success: false, message: `Erreur suppression RDV : ${error.message}` });
  }
};
