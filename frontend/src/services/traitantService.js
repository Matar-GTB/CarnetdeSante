// src/services/traitantService.js
import api from './api';

/**
 * Récupérer la liste complète des médecins (pour la recherche de traitant)
 */
export const getAllMedecins = async () => {
  const res = await api.get('/appointments/disponibles');
  return res.data.data;
};

/**
 * Envoie une nouvelle demande de médecin traitant (patient)
 * @param {{ medecin_id: number, message: string }} payload
 */
export const requestTraitant = async (payload) => {
  const res = await api.post('/traitants/request', payload);
  return res.data.data;
};

/**
 * Récupère toutes les demandes du patient connecté
 * @returns {Promise<Array>}
 */
export const getMyTraitantRequests = async () => {
  const res = await api.get('/traitants/requests');
  return res.data.data;
};

/**
 * Récupère la liste des patients (médecin connecté)
 * @returns {Promise<Array>}
 */
export const getMyPatients = async () => {
  const res = await api.get('/traitants/patients');
  return res.data.data;
};
