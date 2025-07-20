import express from 'express';
import {
  getHorairesByMedecin,
  addOrUpdateHoraire,
  deleteHoraire
} from '../controllers/horairesController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/medecin/:medecinId', getHorairesByMedecin);
router.post('/medecin/:medecinId', addOrUpdateHoraire);
router.delete('/:id', deleteHoraire);

export default router;
