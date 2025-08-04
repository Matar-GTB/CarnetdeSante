// backend/controllers/appointmentController.js

import Appointment from '../models/Appointment.js';
import DemandeTraitant from '../models/DemandeTraitant.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { Op } from 'sequelize';
import Rappel from '../models/Rappel.js';
import HorairesTravail from '../models/HorairesTravail.js';
import Indisponibilite from '../models/Indisponibilite.js';
import dayjs from 'dayjs';
import fr from 'dayjs/locale/fr.js';
dayjs.locale(fr);

/**
 * 1) Créer une demande de RDV (statut = 'en_attente')
 * Validation créneau : libre, dans les horaires, pas bloqué, pas de chevauchement
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
      notes,
      canaux
    } = req.body;

    // 1. Sécurité : un patient ne peut créer que pour lui-même
    if (req.user.role === 'patient' && patient_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Accès interdit' });
    }

    // 2. Validation d'heure logique
    if (heure_fin <= heure_debut) {
      return res.status(400).json({ success: false, message: "L’heure de fin doit être après l’heure de début" });
    }

    // 3. Validation : créneau dans les horaires du médecin (jour/semaine)
    const dateObj = new Date(date_rendezvous);
    const jourSemaine = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    const horaires = await HorairesTravail.findOne({
      where: { medecin_id, jour_semaine: jourSemaine }
    });
    if (!horaires) {
      return res.status(400).json({ success: false, message: "Le médecin n'est pas disponible ce jour-là" });
    }
    if (heure_debut < horaires.heure_debut || heure_fin > horaires.heure_fin) {
      return res.status(400).json({ success: false, message: "Créneau hors horaires de travail du médecin" });
    }

    // 4. Vérifier qu'il n'y a pas déjà un RDV sur ce créneau
    const conflict = await Appointment.findOne({
      where: {
        medecin_id,
        date_rendezvous,
        statut: { [Op.in]: ['planifie', 'en_attente'] },
        [Op.or]: [
          { heure_debut: { [Op.between]: [heure_debut, heure_fin] } },
          { heure_fin: { [Op.between]: [heure_debut, heure_fin] } },
          {
            [Op.and]: [
              { heure_debut: { [Op.lte]: heure_debut } },
              { heure_fin: { [Op.gte]: heure_fin } }
            ]
          }
        ]
      }
    });
    if (conflict) {
      return res.status(409).json({ success: false, message: "Ce créneau est déjà réservé" });
    }

    // 5. Vérifier indisponibilités du médecin (absence, blocage)
    const indispo = await Indisponibilite.findOne({
      where: {
        medecin_id,
        date_debut: { [Op.lte]: date_rendezvous },
        date_fin: { [Op.gte]: date_rendezvous },
        [Op.or]: [
          { heure_debut: { [Op.lte]: heure_debut }, heure_fin: { [Op.gte]: heure_debut } },
          { heure_debut: { [Op.lte]: heure_fin }, heure_fin: { [Op.gte]: heure_fin } }
        ]
      }
    });
    if (indispo) {
      return res.status(400).json({ success: false, message: "Le médecin est indisponible sur ce créneau" });
    }

    // 6. Création du rendez-vous
    const newAppt = await Appointment.create({
      patient_id,
      medecin_id,
      date_rendezvous,
      heure_debut,
      heure_fin,
      type_rendezvous,
      notes
    });

    // 7. Notifications
    const medecinObj = await User.findByPk(medecin_id);
    const patientObj = await User.findByPk(patient_id);
    const nom_medecin = medecinObj ? `${medecinObj.prenom} ${medecinObj.nom}` : '';
    const nom_patient = patientObj ? `${patientObj.prenom} ${patientObj.nom}` : '';

    // Notification au médecin
    await Notification.create({
      utilisateur_id: medecin_id,
      type_notification: 'rendezvous',
      titre: 'Nouvelle demande de RDV',
      message: `Vous avez reçu une demande de RDV de la part de ${nom_patient} pour le ${date_rendezvous} à ${heure_debut}.`,
      est_lu: false
    });

    // 8. Rappels patient (si la date de rappel est future)
    const dateHeureRDV = new Date(`${date_rendezvous}T${heure_debut}`);
    const now = new Date();
    const dateRDV = dayjs(`${date_rendezvous}T${heure_debut}`);
    const maintenant = dayjs();

    const joursDiff = dateRDV.startOf('day').diff(maintenant.startOf('day'), 'day');
    let messageRappel = `Rendez-vous avec Dr ${nom_medecin} `;

    if (joursDiff === 0) {
      messageRappel += `aujourd’hui à ${heure_debut}`;
    } else if (joursDiff === 1) {
      messageRappel += `demain à ${heure_debut}`;
    } else {
      const jourSemaine = dateRDV.format('dddd');
      messageRappel += `${jourSemaine} à ${heure_debut} (dans ${joursDiff} jours)`;
    }

    for (const offset of [24, 2]) {
      const rappelDate = new Date(dateHeureRDV.getTime() - offset * 60 * 60 * 1000);
      if (rappelDate > now) {
        await Rappel.create({
          utilisateur_id: patient_id,
          type_rappel: 'rendezvous',
          details: JSON.stringify({
            medecin_id,
            date: date_rendezvous,
            heure: heure_debut,
            type: type_rendezvous,
            nom_medecin
          }),
          date_heure: rappelDate,
          canaux: JSON.stringify(canaux || { notification: true }),
          message: messageRappel,
          envoye: false,
        });
      }
    }

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
          attributes: ['id', 'prenom', 'nom', 'specialite', 'etablissements', 'photo_profil']
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
      attributes: ['id', 'prenom', 'nom', 'specialite', 'langues', 'etablissements', 'photo_profil']
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
/**
 * 7) Refuser une demande de RDV (statut = 'refuse')
 */
export const refuseAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: 'RDV non trouvé' });
    }
    if (req.user.userId !== appt.medecin_id) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    appt.statut = 'refuse';
    await appt.save();

    // Notifier le patient
    await Notification.create({
      utilisateur_id: appt.patient_id,
      type_notification: 'rendezvous',
      titre: 'RDV refusé',
      message: `Votre RDV du ${appt.date_rendezvous} à ${appt.heure_debut} a été refusé.`,
      est_lu: false
    });

    return res.json({ success: true, data: appt });
  } catch (error) {
    console.error('Erreur refus RDV:', error);
    return res
      .status(500)
      .json({ success: false, message: `Erreur refus RDV : ${error.message}` });
  }
};
//8 Annule
export const cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: 'RDV non trouvé' });
    }
    // Vérifier si c’est le patient OU le médecin qui est propriétaire
    const isOwner =
      req.user.userId === appt.patient_id || req.user.userId === appt.medecin_id;
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    // Message d’annulation passé dans req.body
    const { message } = req.body;
    appt.statut = 'annule';
    appt.notes = message || 'Rendez-vous annulé';
    await appt.save();

    // Notification pour l’autre partie
    const targetId = req.user.userId === appt.patient_id ? appt.medecin_id : appt.patient_id;
    await Notification.create({
      utilisateur_id: targetId,
      type_notification: 'rendezvous',
      titre: 'RDV annulé',
      message: `Le rendez-vous du ${appt.date_rendezvous} à ${appt.heure_debut} a été annulé. Motif : ${message || 'Non précisé'}`,
      est_lu: false
    });

    return res.json({ success: true, data: appt });
  } catch (error) {
    console.error('Erreur annulation RDV:', error);
    return res
      .status(500)
      .json({ success: false, message: `Erreur annulation RDV : ${error.message}` });
  }
};
/**
 * 9) Renvoyer les créneaux disponibles d’un médecin pour une date donnée
 * GET /api/appointments/:medecinId/disponibles/:date
 */
export const getCreneauxDisponibles = async (req, res) => {
  try {
    const { medecinId, date } = req.params;

    const dateObj = new Date(date);
    const jourSemaine = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();

    const horaire = await HorairesTravail.findOne({
      where: { medecin_id: medecinId, jour_semaine: jourSemaine }
    });

    if (!horaire) {
      return res.json({ success: true, data: {creneaux: [], duree: null,travail: false } });
    }

    const { heure_debut, heure_fin, duree_creneau } = horaire;

    // Génère les créneaux entre heure_debut et heure_fin
    const generateTimeSlots = (start, end, duration) => {
      const slots = [];
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      let current = new Date(0, 0, 0, startH, startM);
      const endTime = new Date(0, 0, 0, endH, endM);

      while (current.getTime() < endTime.getTime()) {
        const h = current.getHours().toString().padStart(2, '0');
        const m = current.getMinutes().toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
        current.setMinutes(current.getMinutes() + duration);
      }

      return slots;
    };

    const allSlots = generateTimeSlots(heure_debut, heure_fin, duree_creneau);

    // Récupère tous les RDV planifiés ou en attente
    const existingRDVs = await Appointment.findAll({
      where: {
        medecin_id: medecinId,
        date_rendezvous: date,
        statut: { [Op.in]: ['planifie', 'en_attente'] }
      }
    });

    // Fonction pour soustraire 1 minute à une heure
    const subtractOneMinute = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date(0, 0, 0, h, m);
  date.setMinutes(Math.max(0, date.getMinutes() - 1));
  return date.toTimeString().slice(0, 5);
};


    // Créneaux bloqués par RDV existants
    let busyTimes = [];
    for (const rdv of existingRDVs) {
      const start = rdv.heure_debut;
      const end = subtractOneMinute(rdv.heure_fin);
      const blocked = generateTimeSlots(start, end, duree_creneau);
      busyTimes.push(...blocked);
    }
const computeEndTime = (start, duration) => {
  const [h, m] = start.split(':').map(Number);
  const date = new Date(0, 0, 0, h, m);
  date.setMinutes(date.getMinutes() + duration - 1);
  return date.toTimeString().slice(0, 5); // Fin incluse
};

    // Créneaux bloqués par indisponibilités
    const indispos = await Indisponibilite.findAll({
      where: {
        medecin_id: medecinId,
        date_debut: { [Op.lte]: date },
        date_fin: { [Op.gte]: date }
      }
    });

    let blockedSlots = [];
    for (const ind of indispos) {
      const indStart = ind.heure_debut;
      const indEnd = subtractOneMinute(ind.heure_fin);
      const blocked = generateTimeSlots(indStart, indEnd, duree_creneau);
      blockedSlots.push(...blocked);
    }

    // Supprimer les créneaux déjà pris ou bloqués
    const availableSlots = allSlots.filter(
      s => !busyTimes.includes(s) && !blockedSlots.includes(s)
    );

    return res.json({
  success: true,
  data: {
    creneaux: availableSlots,
    duree: duree_creneau,
    travail: true
  }
    });
  } catch (error) {
    console.error('Erreur créneaux dispo:', error);
    return res.status(500).json({ success: false, message: 'Erreur récupération créneaux' });
  }
};
