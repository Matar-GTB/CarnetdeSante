// backend/routes/appointmentRoutes.js
import express from 'express';
import {
  getAppointmentsByUser,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment
} from '../controllers/appointmentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Obtenir tous les rendez-vous liés à un utilisateur (patient ou médecin)
router.get('/user/:userId', authMiddleware, getAppointmentsByUser);

// Créer un rendez-vous
router.post('/', authMiddleware, createAppointment);

// Mettre à jour le statut (ex : confirmé, annulé)
router.put('/:id/status', authMiddleware, updateAppointmentStatus);

// Supprimer un rendez-vous
router.delete('/:id', authMiddleware, deleteAppointment);

export default router;