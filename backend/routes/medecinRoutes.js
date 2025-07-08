import express from 'express';
import { getPatientsByMedecin } from '../controllers/medecinController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/mes-patients', authMiddleware, getPatientsByMedecin);

export default router;
