import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  getMedicaments,
  addMedicament,
  deleteMedicament,
  updateMedicament,
  getMedicationById
} from '../controllers/medicationController.js';

const router = express.Router();

router.get('/', authMiddleware, getMedicaments);
router.post('/', authMiddleware, addMedicament);
router.delete('/:id', authMiddleware, deleteMedicament);
router.put('/:id', authMiddleware, updateMedicament);
router.get('/:id', authMiddleware, getMedicationById);
export default router;
