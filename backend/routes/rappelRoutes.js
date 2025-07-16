// backend/routes/rappelRoutes.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  listerRappels,
  obtenirRappel,
  creerRappel,
  modifierRappel,
  supprimerRappel
} from '../controllers/rappelController.js';

const router = express.Router();
router.use(authMiddleware);
router.get('/', listerRappels);
router.get('/:id', obtenirRappel);
router.post('/', creerRappel);
router.put('/:id', modifierRappel);
router.delete('/:id', supprimerRappel);

export default router;