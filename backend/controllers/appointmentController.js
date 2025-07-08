// backend/controllers/appointmentController.js
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { Op } from 'sequelize';

/**
 * 📅 Créer un nouveau rendez-vous
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

    // Vérifie que le patient crée un rdv pour lui-même
    if (req.user.role === 'patient' && patient_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Accès interdit' });
    }

    const newAppointment = await Appointment.create({
      patient_id,
      medecin_id,
      date_rendezvous,
      heure_debut,
      heure_fin,
      type_rendezvous,
      notes,
      statut: 'planifie'
    });

    // Crée une notification pour le médecin
    await Notification.create({
      utilisateur_id: medecin_id,
      type_notification: 'rendezvous',
      titre: 'Nouveau rendez-vous',
      message: `Nouveau rendez-vous avec ${req.user.nom_complet}`,
      est_lu: false
    });

    res.status(201).json({ success: true, data: newAppointment });
  } catch (error) {
    handleServerError(res, error, 'Erreur lors de la création du rendez-vous');
  }
};
/**
 * 🔄 Mettre à jour le statut d'un rendez-vous
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { statut } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    }

    if (appointment.medecinId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    appointment.statut = statut || 'planifié';
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (error) {
    handleServerError(res, error, 'Erreur lors de la mise à jour du rendez-vous');
  }
};

/**
 * 📖 Obtenir tous les rendez-vous d’un utilisateur
 */
export const getAppointmentsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const appointments = await Appointment.findAll({
      where: {
        [Op.or]: [
          { patientId: userId },
          { medecinId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'Patient',
          attributes: ['id', 'prenom', 'nom']
        },
        {
          model: User,
          as: 'Medecin',
          attributes: ['id', 'prenom', 'nom', 'specialite']
        }
      ],
      order: [['date_heure', 'ASC']]
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    handleServerError(res, error, 'Erreur lors de la récupération des rendez-vous');
  }
};

/**
 * ❌ Supprimer un rendez-vous
 */
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    }

    const isOwner = req.user.userId === appointment.patientId || req.user.userId === appointment.medecinId;

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await appointment.destroy();
    res.json({ success: true, message: 'Rendez-vous supprimé' });
  } catch (error) {
    handleServerError(res, error, 'Erreur lors de la suppression du rendez-vous');
  }
};

/**
 * 🔧 Gestion centralisée des erreurs serveur
 */
function handleServerError(res, error, message) {
  console.error(error);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Erreur serveur' : `${message}: ${error.message}`
  });
}