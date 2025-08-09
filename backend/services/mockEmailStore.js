// backend/services/mockEmailStore.js

/**
 * Service de stockage des emails simulés pour le développement
 * Permet de stocker et récupérer les derniers emails simulés envoyés
 */

// Stockage des 10 derniers emails simulés
const mockEmails = [];
const MAX_STORED_EMAILS = 10;

/**
 * Ajoute un email simulé au stockage
 * @param {Object} emailData - Données de l'email
 */
export const storeEmail = (emailData) => {
  // Ajouter l'email au début du tableau
  mockEmails.unshift({
    ...emailData,
    timestamp: new Date().toISOString()
  });
  
  // Limiter le nombre d'emails stockés
  if (mockEmails.length > MAX_STORED_EMAILS) {
    mockEmails.pop();
  }
};

/**
 * Récupère tous les emails simulés stockés
 * @returns {Array} - Liste des emails simulés
 */
export const getAllEmails = () => {
  return [...mockEmails];
};

/**
 * Récupère le dernier email envoyé à une adresse spécifique
 * @param {string} email - Adresse email du destinataire
 * @returns {Object|null} - Dernier email envoyé ou null si aucun
 */
export const getLastEmailFor = (email) => {
  return mockEmails.find(item => item.to === email) || null;
};

/**
 * Vide le stockage des emails simulés
 */
export const clearEmails = () => {
  mockEmails.length = 0;
};

export default {
  storeEmail,
  getAllEmails,
  getLastEmailFor,
  clearEmails
};
