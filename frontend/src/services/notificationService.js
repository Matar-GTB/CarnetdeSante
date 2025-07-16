import { API } from './authService';

/**
 * 🔔 Récupère la liste des notifications
 */
export const getNotificationsApi = () =>
  API.get('/notifications').then(res => res.data.data);

/**
 * ✅ Marque une notification comme lue
 */
export const markNotificationAsReadApi = (id) =>
  API.put(`/notifications/${id}/read`).then(res => res.data.data);

/**
 * ❌ Supprime une notification
 */
export const deleteNotificationApi = (id) =>
  API.delete(`/notifications/${id}`).then(res => res.data);

/**
 * ⚙ Récupère les préférences de notification de l'utilisateur
 */
export const getNotificationSettingsApi = () =>
  API.get('/notifications/settings')
     .then(res => res.data.data); // ✅ pas de .preferences_notifications ici

/**
 * 🔄 Met à jour les préférences de notification
 */
export const updateNotificationSettingsApi = (prefs) =>
  API.put('/notifications/settings', { preferences: prefs }).then(res => res.data);
