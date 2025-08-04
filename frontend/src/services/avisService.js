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
 */
export const getAvisMedecin = async (medecinId) => {
  const res = await API.get(`/avis/medecin/${medecinId}`);
  return res.data.data;
};

/**
 * Récupérer l'avis d'un patient pour un médecin spécifique
 * @param {number} medecinId - ID du médecin
 */
export const getAvisPatientPourMedecin = async (medecinId) => {
  const res = await API.get(`/avis/patient-medecin/${medecinId}`);
  return res.data.data;
};

/**
 * Supprimer un avis
 * @param {number} avisId - ID de l'avis
 */
export const supprimerAvis = async (avisId) => {
  const res = await API.delete(`/avis/${avisId}`);
  return res.data;
};
