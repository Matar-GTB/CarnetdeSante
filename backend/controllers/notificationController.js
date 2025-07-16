import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { genererRappelsMedicaments } from '../utils/rappels/genererRappelsMedicaments.js';
/**
 * 🔔 Obtenir les notifications de l'utilisateur connecté
 */
export const getNotifications = async (req, res) => {
  try {
    await genererRappelsMedicaments(req.user.userId); // Génère les rappels à chaque requête

    const notifications = await Notification.findAll({
      where: { utilisateur_id: req.user.userId },
      order: [['date_creation', 'DESC']],
      limit: 30
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    handleServerError(res, error, "Erreur lors de la récupération des notifications");
  }
};

/**
 * ✅ Marquer une notification comme lue
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    //console.log('Notification trouvée :', notification); TEST
    //console.log('Utilisateur connecté :', req.user);TEST
    if (!notification || notification.utilisateur_id !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    notification.est_lu = true;

    await notification.save();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    handleServerError(res, error, "Erreur lors de la mise à jour de la notification");
  }
};

/**
 * ❌ Supprimer une notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification || notification.utilisateur_id !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification supprimée'
    });
  } catch (error) {
    handleServerError(res, error, "Erreur lors de la suppression de la notification");
  }
};

// 🔧 Gestion centralisée des erreurs
function handleServerError(res, error, defaultMessage) {
  console.error(error);
  const message = process.env.NODE_ENV === 'production'
    ? 'Erreur serveur'
    : `${defaultMessage}: ${error.message}`;

  res.status(500).json({
    success: false,
    message
  });
}
/**
 * ⚙ Met à jour les préférences de notification
 */
export const updateNotificationSettings = async (req, res) => {
  try {
    const { preferences } = req.body;

    // Exemple : sauvegarde dans une colonne JSON dans la table utilisateurs
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.preferences_notifications = preferences; // Il faut que ce champ existe dans le modèle
    await user.save();

    res.json({ success: true, message: 'Préférences mises à jour', data: user.preferences_notifications });
  } catch (error) {
    handleServerError(res, error, "Erreur mise à jour préférences");
  }
};

export const getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json({ success: true, data: user.preferences_notifications || {} });
  } catch (error) {
    handleServerError(res, error, "Erreur récupération préférences");
  }
}
