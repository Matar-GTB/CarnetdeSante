import express from 'express';
import {
  getDocuments,
  uploadDocument,
  getVaccinations,
  addVaccination,
  deleteDocument,
  downloadDocument,
  deleteVaccination
} from '../controllers/medicalController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ Routes documents médicaux
router.post('/upload', authMiddleware, upload.single('fichier'), uploadDocument);
router.get('/documents', authMiddleware, getDocuments); // 👈 LA BONNE ROUTE
router.delete('/documents/:id', authMiddleware, deleteDocument);
router.get('/documents/:id/download', authMiddleware, downloadDocument);

// ✅ Routes vaccinations
router.get('/vaccinations', authMiddleware, getVaccinations);
router.post('/vaccinations', authMiddleware, addVaccination);
router.delete('/vaccinations/:id', authMiddleware, deleteVaccination);

export default router;
