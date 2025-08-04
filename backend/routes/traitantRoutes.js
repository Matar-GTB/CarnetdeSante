// backend/routes/traitantRoutes.js
import express from 'express';
import {
  createDemandeTraitant,
  getDemandeTraitantByPatient,
  getPatientsByMedecin,
  getMesTraitants,
  cancelDemandeTraitant,
  getDemandesPourMedecin,
  repondreDemandeTraitant,
  getPatientProfile,
  removeTraitant,
  setTraitantPrincipal,
  removePatientRelation
} from '../controllers/traitantController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🛡️ Toutes les routes sont protégées par authMiddleware (vérifie le token)
router.use(authMiddleware);

/**
 * 🟢 Patient → Envoie une demande à un médecin
 * POST /api/traitants/request
 */
router.post('/request', createDemandeTraitant);

/**
 * 🟢 Patient → Liste de ses demandes (en attente, acceptées, refusées)
 * GET /api/traitants/requests
 */
router.get('/requests', getDemandeTraitantByPatient);

/**
 * 🟢 Patient → Liste de ses médecins traitants acceptés
 * GET /api/traitants/mes-traitants
 */
router.get('/mes-traitants', getMesTraitants);

/**
 * 🟢 Patient → Annule une demande en attente
 * DELETE /api/traitants/requests/:id
 */
router.delete('/requests/:id', cancelDemandeTraitant);

/**
 * 🟢 Patient → Supprime un médecin traitant accepté
 * DELETE /api/traitants/remove/:medecinId
 */
router.delete('/remove/:medecinId', removeTraitant);

/**
 * 🟢 Patient → Définit un médecin comme traitant principal
 * PUT /api/traitants/set-principal/:medecinId
 */
router.put('/set-principal/:medecinId', setTraitantPrincipal);

/**
 * 👨‍⚕️ Médecin → Liste des patients ayant accepté ce médecin
 * GET /api/traitants/patients
 */
router.get('/patients', getPatientsByMedecin);

/**
 * 👨‍⚕️ Médecin → Récupère les demandes reçues
 * GET /api/traitants/demandes
 */
router.get('/demandes', getDemandesPourMedecin);

/**
 * 👨‍⚕️ Médecin → Accepte ou refuse une demande de patient
 * PUT /api/traitants/demandes/:id/repondre
 */
router.put('/demandes/:id/repondre', repondreDemandeTraitant);

/**
 * 👨‍⚕️ Médecin → Accède au profil complet d'un patient lié
 * GET /api/traitants/patient/:id/profile
 */
router.get('/patient/:id/profile', getPatientProfile);

/**
 * 👨‍⚕️ Médecin → Supprime un patient (relation médecin ↔ patient)
 * DELETE /api/traitants/patients/:patientId
 */
router.delete('/patients/:patientId', removePatientRelation);

export default router;
