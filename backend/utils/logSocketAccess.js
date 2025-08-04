import AccessLog from '../models/AccessLog.js';

/**
 * Log RGPD pour les événements Socket.io
 * @param {Object} socket - Socket client connecté
 * @param {string} action - 'consultation', 'partage', etc.
 * @param {string} cible - 'message', 'conversation', etc.
 * @param {number} id_cible - ID concerné
 * @param {boolean} via_token - vrai si accès public/token
 */
export const logSocketAccess = async ({
  socket,
  action = 'consultation',
  cible = 'message',
  id_cible = 0,
  via_token = false
}) => {
  try {
    const user = socket.user; // injecté après auth
    if (!user) return;

    await AccessLog.create({
      utilisateur_id: user.userId,
      type_action: action,
      type_cible: cible,
      id_cible,
      adresse_ip: socket.handshake.address,
      user_agent: socket.handshake.headers['user-agent'],
      via_token
    });
  } catch (err) {
    console.error('Erreur logSocketAccess :', err.message);
  }
};
