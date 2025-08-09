// frontend/src/services/avisService.js
import { API } from './authService';

/**
 * Laisser un avis sur un médecin
 * @param {Object} avisData - { medecin_id, note, commentaire, anonyme }
 */
export const laisserAvis = async (avisData) => {
  const res = await API.post('/avis', avisData);
  return res.data;
};

/**
 * Récupérer les avis d'un médecin
 * @param {number} medecinId - ID du médecin
 * @returns {Promise<Array>} Un tableau d'avis, vide s'il n'y en a pas
 */
export const getAvisMedecin = async (medecinId) => {
  try {
    const res = await API.get(`/avis/medecin/${medecinId}`);
    console.log('Réponse brute du serveur pour les avis:', res.data);
    
    // Vérifier que la réponse contient les avis dans la structure attendue
    // Le contrôleur backend renvoie { success: true, data: { avis: [...], note_moyenne: X, nombre_avis: Y } }
    if (res.data && res.data.success && res.data.data && res.data.data.avis) {
      console.log('Structure correcte trouvée - avis dans data.data.avis');
      return res.data.data.avis;
    } 
    // Fallback 1: Peut-être que les données sont directement dans data
    else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      console.log('Fallback 1 - avis dans data.data');
      return res.data.data;
    }
    // Fallback 2: Peut-être que les données sont directement la réponse
    else if (Array.isArray(res.data)) {
      console.log('Fallback 2 - avis directement dans data');
      return res.data;
    }
    
    console.warn('Structure inattendue pour les avis, renvoie tableau vide');
    return [];
  } catch (err) {
    console.error('Erreur lors de la récupération des avis:', err);
    return []; // Retourner un tableau vide en cas d'erreur
  }
};

/**
 * Récupérer l'avis d'un patient pour un médecin spécifique
 * @param {number} medecinId - ID du médecin
 * @returns {Promise<Object|null>} L'avis du patient ou null
 */
export const getAvisPatientPourMedecin = async (medecinId) => {
  try {
    const res = await API.get(`/avis/patient-medecin/${medecinId}`);
    return res.data.data || null;
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'avis du patient:', err);
    return null;
  }
};

/**
 * Supprimer un avis
 * @param {number} avisId - ID de l'avis
 */
export const supprimerAvis = async (avisId) => {
  const res = await API.delete(`/avis/${avisId}`);
  return res.data;
};
