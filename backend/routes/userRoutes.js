import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllDoctors,
  getDoctorDetails,
  searchDoctors,
  updateProfileWithPhoto
} from '../controllers/userController.js';
import { uploadProfilePhoto } from '../middlewares/uploadMiddleware.js';


import { authMiddleware} from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();
router.put('/profile-with-photo', authMiddleware, uploadProfilePhoto, updateProfileWithPhoto);
// 🔐 Profil utilisateur connecté (nécessite authentification)
router.get('/me', authMiddleware, getProfile);

// 🔄 Mise à jour du profil
router.put('/me', authMiddleware, updateProfile);

// 🔍 Rechercher des médecins avec filtres (accessible sans token)
router.get('/search', searchDoctors);

// 🌐 Obtenir la liste publique de tous les médecins
router.get('/doctors', getAllDoctors);

// ℹ Obtenir le profil public d’un médecin par son ID
router.get('/doctors/:id', getDoctorDetails);
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