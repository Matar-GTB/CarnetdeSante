import express from 'express';
import {
  getIndisposByMedecin,
  createIndispo,
  deleteIndispo
} from '../controllers/indisponibiliteController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/medecin/:medecinId', getIndisposByMedecin);
router.post('/', createIndispo);
router.delete('/:id', deleteIndispo);

export default router;
