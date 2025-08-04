import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  getHorairesByMedecin,
  addOrUpdateHoraire,
  deleteHoraire,
  getIndisposByMedecin,
  createIndispo,
  deleteIndispo
} from '../controllers/disponibiliteController.js';

const router = express.Router();

// Horaires de travail
router.get('/horaires', authMiddleware, getHorairesByMedecin);
router.put('/horaires/:jour', authMiddleware, addOrUpdateHoraire);
router.delete('/horaires/:id', authMiddleware, deleteHoraire);

// Indisponibilités ponctuelles
router.get('/indispos/medecin', authMiddleware, getIndisposByMedecin);
router.post('/indispos', authMiddleware, createIndispo);
router.delete('/indispos/:id', authMiddleware, deleteIndispo);

export default router;
