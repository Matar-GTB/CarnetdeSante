// backend/routes/profileRoutes.js
import express from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';
import {
  getMyProfile,
  updateMyProfile,
  generateEmergencyLink,
  getEmergencyProfile,
  revokeEmergencyLink,
  getProfileStats,
  getPublicPatientProfile,
  getPublicMedecinProfile
} from '../controllers/profileController.js';

const router = express.Router();

/**
 * Profil de l'utilisateur connecté - Routes protégées
 */
// GET /api/profile/me - Récupérer mon profil
router.get('/me', authMiddleware, getMyProfile);

// PUT /api/profile/me - Mettre à jour mon profil  
router.put('/me', authMiddleware, updateMyProfile);



/**
 * Liens d'urgence (patients uniquement)
 */
// POST /api/profile/emergency/generate - Générer un lien d'urgence
router.post('/emergency/generate', authMiddleware, checkRole(['patient']), generateEmergencyLink);

// DELETE /api/profile/emergency/revoke - Révoquer le lien d'urgence actuel
router.delete('/emergency/revoke', authMiddleware, checkRole(['patient']), revokeEmergencyLink);

/**
 * Statistiques du profil
 */
// GET /api/profile/stats - Récupérer les statistiques de mon profil
router.get('/stats', authMiddleware, getProfileStats);

/**
 * Routes publiques (sans authentification)
 */
const publicRouter = express.Router();

// GET /api/profile/emergency/:patientId/:token - Accès d'urgence (public)
publicRouter.get('/emergency/:patientId/:token', getEmergencyProfile);

// GET /api/profile/patient/:id/public - Profil public d'un patient
publicRouter.get('/patient/:id/public', optionalAuthMiddleware, getPublicPatientProfile);

// GET /api/profile/doctors/:id/public - Profil public d'un médecin
publicRouter.get('/doctors/:id/public', optionalAuthMiddleware, getPublicMedecinProfile);

// Combiner les routes
const combinedRouter = express.Router();
combinedRouter.use('/', router);
combinedRouter.use('/', publicRouter);

export default combinedRouter;