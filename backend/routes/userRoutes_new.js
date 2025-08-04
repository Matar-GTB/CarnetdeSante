import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllDoctors,
  getDoctorDetails,
  getPublicMedecinProfile,
  searchDoctors,
  updateProfileWithPhoto
} from '../controllers/userController.js';
import { uploadProfilePhoto } from '../middlewares/uploadMiddleware.js';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';

console.log('🆕 NOUVEAU USERROUTES: Module chargé avec succès');

const router = express.Router();

// Route de test pour vérifier le nouveau fichier
router.get('/test', (req, res) => {
  console.log('🆕 NOUVEAU USERROUTES: Route /test appelée');
  res.json({ 
    message: 'NOUVEAU UserRoutes fonctionne correctement', 
    timestamp: new Date().toISOString(),
    version: 'nouvelle_version'
    
  });
});

// Route des médecins (la plus importante)
router.get('/doctors', (req, res) => {
  console.log('🆕 NOUVEAU USERROUTES: Route /doctors appelée');
  getAllDoctors(req, res);
});

// Recherche de médecins (publique)
router.get('/search', searchDoctors);

// Profil public d'un médecin
router.get('/doctors/:id/public', optionalAuthMiddleware, getPublicMedecinProfile);

// Profil complet d'un médecin (authentifié)
router.get('/doctors/:id', authMiddleware, getDoctorDetails);

// Profil utilisateur connecté
router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, updateProfile);
router.put('/profile-with-photo', authMiddleware, uploadProfilePhoto, updateProfileWithPhoto);

// Liste de tous les utilisateurs (avec authentification)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const role = req.query.role;
    const where = role ? { role } : {};
    const users = await User.findAll({
      where,
      attributes: { exclude: ['mot_de_passe', 'token_reinitialisation', 'expiration_token_reinitialisation'] }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

console.log('🆕 NOUVEAU USERROUTES: Export du router');
export default router;
