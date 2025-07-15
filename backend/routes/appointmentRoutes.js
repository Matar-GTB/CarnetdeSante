// backend/routes/appointmentRoutes.js

import express from 'express';
import {
  createAppointment,
  acceptAppointment,
  getMedecinsTraitants,
  getMedecinsDisponibles,
  getAppointmentsByUser,
  deleteAppointment
} from '../controllers/appointmentController.js';
import  { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent authentification
router.use(authMiddleware);

// 1) Demande de RDV (patient) → statut 'en_attente'
router.post('/', createAppointment);

// 2) Médecin accepte une demande → passe en 'planifie'
router.patch('/:id/accept', acceptAppointment);

// 3) Liste des médecins traitants pour le patient
router.get('/traitants', getMedecinsTraitants);

// 4) Liste de tous les médecins (pour recherche)
router.get('/disponibles', getMedecinsDisponibles);

// 5) Récupérer les RDV d’un utilisateur
router.get('/user/:userId', getAppointmentsByUser);

// 6) Annuler / supprimer un RDV
router.delete('/:id', deleteAppointment);

export default router;
