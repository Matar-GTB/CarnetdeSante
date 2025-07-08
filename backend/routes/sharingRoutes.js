// backend/routes/sharingRoutes.js
import express from 'express';
import {
  grantAccessToDoctor,
  revokeDoctorAccess,
  listAuthorizedDoctors,
  createShareLink,
  getSharedDocuments,
  revokeShareLink,
  getAccessLogs
} from '../controllers/sharingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. Partage permanent : patient → médecin
router.post('/', authMiddleware, grantAccessToDoctor);         // Autoriser
router.delete('/:medecinId', authMiddleware, revokeDoctorAccess); // Révoquer
router.get('/my-doctors', authMiddleware, listAuthorizedDoctors); // Voir les médecins autorisés

// 2. Lien temporaire de partage (token public)
router.post('/generate', authMiddleware, createShareLink);     // Générer un lien
router.get('/documents/:token', getSharedDocuments);           // Accès via lien
router.delete('/revoke/:id', authMiddleware, revokeShareLink); // Révoquer lien

// 3. Historique des accès
router.get('/logs/:userId', authMiddleware, getAccessLogs);

export default router;