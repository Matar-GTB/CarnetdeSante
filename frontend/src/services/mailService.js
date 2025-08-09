// services/mailService.js
import { API } from './authService';

/**
 * Ce service envoie les demandes d'emails au backend qui se charge de l'envoi réel
 * Cela évite d'exposer les identifiants d'email dans le frontend
 */

export const sendEmail = async ({ to, subject, text }) => {
  try {
    // Utilise le nouveau endpoint /api/mail/send
    await API.post('/mail/send', { to, subject, text });
    console.log(`✉️ Demande d'email envoyée au serveur pour ${to}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Erreur lors de la demande d\'envoi d\'email :', err);
    throw err;
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  try {
    // La construction de l'URL et l'envoi sont gérés par le backend
    await API.post('/password/forgot', { email });
    console.log('✉️ Demande de réinitialisation de mot de passe envoyée');
    return { success: true, message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation.' };
  } catch (err) {
    console.error('❌ Erreur lors de la demande de réinitialisation de mot de passe :', err);
    // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou pas
    return { success: true, message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation.' };
  }
};