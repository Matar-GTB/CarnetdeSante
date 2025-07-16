// backend/routes/notificationRoutes.js
import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  updateNotificationSettings,
  getNotificationSettings 
} from '../controllers/notificationController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Récupérer les dernières notifications
router.get('/', authMiddleware, getNotifications);

// Marquer une notification comme lue
router.put('/:id/read', authMiddleware, markNotificationAsRead);

// Supprimer une notification
router.delete('/:id', authMiddleware, deleteNotification);

// Mettre à jour les préférences de notification
router.put('/settings', authMiddleware, updateNotificationSettings);
router.get('/settings', authMiddleware, getNotificationSettings);

export default router;