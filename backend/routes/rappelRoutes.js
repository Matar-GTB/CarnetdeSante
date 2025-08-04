// backend/routes/rappelRoutes.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  listerRappels,
  obtenirRappel,
  creerRappel,
  modifierRappel,
  supprimerRappel,
  historiqueRappels,
  supprimerRappelsMultiples
} from '../controllers/rappelController.js';

const router = express.Router();
router.use(authMiddleware);

// ✅ Routes spécifiques d'abord (sans préfixe redondant)
router.get('/historique', historiqueRappels);
router.post('/supprimer-multiples', supprimerRappelsMultiples);

// ✅ Ensuite les routes standards
router.get('/', listerRappels);
router.get('/:id', obtenirRappel);
router.post('/', creerRappel);
router.put('/:id', modifierRappel);
router.delete('/:id', supprimerRappel);

export default router;
