import express from 'express';
import {
  createConsultation,
  updateConsultation,
  getConsultationsByPatient,
  getConsultationByRendezvous
} from '../controllers/consultationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Créer une consultation
router.post('/', createConsultation);
// Mettre à jour une consultation
router.patch('/:id', updateConsultation);
// Récupérer toutes les consultations d'un patient
router.get('/patient/:patient_id', getConsultationsByPatient);
// Récupérer une consultation par rendezvous
router.get('/rendezvous/:rendezvous_id', getConsultationByRendezvous);

export default router;
