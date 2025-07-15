// backend/routes/traitantRoutes.js
import express from 'express';
import {
  createDemandeTraitant,
  getDemandeTraitantByPatient,
  getPatientsByMedecin
} from '../controllers/traitantController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🛡️ Toutes ces routes exigent un token JWT valide
router.use(authMiddleware);

/**
 * Patient → nouvelle demande de médecin traitant
 * POST /api/traitants/request
 */
router.post('/request', createDemandeTraitant);

/**
 * Patient → liste de ses propres demandes
 * GET /api/traitants/requests
 */
router.get('/requests', getDemandeTraitantByPatient);

/**
 * Médecin → liste de tous les patients qui l'ont accepté comme traitant
 * GET /api/traitants/patients
 */
router.get('/patients', getPatientsByMedecin);

export default router;
