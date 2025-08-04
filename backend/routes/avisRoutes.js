// backend/routes/avisRoutes.js
import express from 'express';
import {
  laisserAvis,
  getAvisMedecin,
  getAvisPatientPourMedecin,
  supprimerAvis
} from '../controllers/avisController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * Laisser un avis sur un médecin (patient uniquement)
 * POST /api/avis
 */
router.post('/', laisserAvis);

/**
 * Récupérer les avis d'un médecin (public pour les utilisateurs connectés)
 * GET /api/avis/medecin/:id
 */
router.get('/medecin/:id', getAvisMedecin);

/**
 * Récupérer l'avis d'un patient pour un médecin spécifique
 * GET /api/avis/patient-medecin/:medecinId
 */
router.get('/patient-medecin/:medecinId', getAvisPatientPourMedecin);

/**
 * Supprimer son propre avis (patient uniquement)
 * DELETE /api/avis/:id
 */
router.delete('/:id', supprimerAvis);

export default router;
