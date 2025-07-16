import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  getMedicaments,
  addMedicament,
  deleteMedicament
} from '../controllers/medicationController.js';

const router = express.Router();

router.get('/', authMiddleware, getMedicaments);
router.post('/', authMiddleware, addMedicament);
router.delete('/:id', authMiddleware, deleteMedicament);

export default router;
