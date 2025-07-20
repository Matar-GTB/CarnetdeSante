import express from 'express';
import {
  createAppointment,
  acceptAppointment,
  refuseAppointment,
  cancelAppointment,
  getMedecinsTraitants,
  getMedecinsDisponibles,
  getAppointmentsByUser,
  deleteAppointment,
  getCreneauxDisponibles
} from '../controllers/appointmentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Création d'une demande de RDV (patient)
router.post('/', createAppointment);

// Accepter une demande (médecin)
router.patch('/:id/accept', acceptAppointment);

// Refuser une demande (médecin)
router.patch('/:id/refuse', refuseAppointment);

// Annuler un RDV (patient ou médecin)
router.patch('/:id/cancel', cancelAppointment);

// Supprimer définitivement un RDV (patient ou médecin)
router.delete('/:id', deleteAppointment);

// Liste des médecins traitants pour le patient connecté
router.get('/traitants', getMedecinsTraitants);

// Liste de tous les médecins disponibles pour la prise de RDV
router.get('/disponibles', getMedecinsDisponibles);

// Liste des RDV pour un utilisateur donné (patient ou médecin)
router.get('/user/:userId', getAppointmentsByUser);
//
router.get('/:medecinId/disponibles/:date', getCreneauxDisponibles);

export default router;
