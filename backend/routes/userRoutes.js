import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllDoctors,
  getDoctorDetails, // (Profil complet, pour admin ou médecin lui-même)
  getPublicMedecinProfile,
  searchDoctors,
  updateProfileWithPhoto
} from '../controllers/userController.js';
import { uploadProfilePhoto } from '../middlewares/uploadMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Profil utilisateur connecté (nécessite authentification)
router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, updateProfile);
router.put('/profile-with-photo', authMiddleware, uploadProfilePhoto, updateProfileWithPhoto);

// Recherche de médecins (publique)
router.get('/search', searchDoctors);

// Liste publique de tous les médecins
router.get('/doctors', getAllDoctors);

// Profil public d’un médecin, version “Doctolib-like” avec tarifs/FAQ/présentation/etc.
router.get('/doctors/:id/public', getPublicMedecinProfile);

// Profil complet d’un médecin (réservé, ex : médecin lui-même, admin)
router.get('/doctors/:id', getDoctorDetails);

// (Optionnel) Liste utilisateurs, à sécuriser si besoin
router.get('/', authMiddleware, async (req, res) => {
  try {
    const role = req.query.role;
    const where = role ? { role } : {};
    const users = await User.findAll({
      where,
      attributes: ['id', 'prenom', 'nom', 'email', 'specialite']
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
