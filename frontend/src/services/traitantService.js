// src/services/traitantService.js
import { API } from './authService';




/**
 * Récupérer la liste complète des médecins (pour la recherche de traitant)
 */
export const getAllMedecins = async () => {
  const res = await API.get('/users/doctors');
  return res.data.data;
};

/**
 * Envoie une nouvelle demande de médecin traitant (patient)
 * @param {{ medecin_id: number, message: string }} payload
 */
export const requestTraitant = async (payload) => {
  const res = await API.post('/traitants/request', payload);
  return res.data.data;
};

/**
 * Récupère toutes les demandes du patient connecté
 * @returns {Promise<Array>}
 */
export const getMyTraitantRequests = async () => {
  const res = await API.get('/traitants/requests');
  return res.data.data;
};

/**
 * Récupère la liste des patients (médecin connecté)
 * @returns {Promise<Array>}
 */
export const getMyPatients = async () => {
  const res = await API.get('/traitants/patients');
  return res.data.data;
};

/**
 * Récupère les statistiques du médecin connecté
 * @returns {Promise<Object>}
 */
export const getMedecinStats = async () => {
  try {
    const patients = await getMyPatients();
    
    // Pour l'instant, on calcule les stats de base côté frontend
    // Plus tard, on pourra créer un endpoint dédié
    const stats = {
      total_patients: patients.length,
      rdv_ce_mois: 0, // À implémenter avec les RDV
      note_moyenne: 0, // À implémenter avec les avis
      avis_total: 0
    };
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return { success: false, data: { total_patients: 0, rdv_ce_mois: 0, note_moyenne: 0, avis_total: 0 } };
  }
};

/**
 * Méthode wrapper pour compatibilité avec le composant MedecinProfilePrive
 */
export const getMedecinPatients = async (medecinId) => {
  return await getMyPatients();
};

/**
 * Récupère la liste des médecins traitants acceptés pour le patient connecté
 * @returns {Promise<Array>}  // Array de médecins : { id, prenom, nom, specialite, etablissements, ... }
 */
export const getMyTraitants = async () => {

 const res = await API.get('/traitants/mes-traitants');
 return res.data.data;
};

export const cancelTraitantRequest = async (id) => {
  const res = await API.delete(`/traitants/requests/${id}`);
  return res.data;
};

/**
 * Récupère les demandes en attente pour le médecin connecté
 * @returns {Promise<Array>}
 */
export const getDemandesPourMedecin = async () => {
  const res = await API.get('/traitants/demandes');
  return res.data.data;
};

/**
 * Accepte ou refuse une demande de patient
 * @param {number} id - ID de la demande
 * @param {string} statut - 'accepte' ou 'refuse'
 * @param {string} message_reponse - Message optionnel
 * @returns {Promise<Object>}
 */
export const repondreDemandeTraitant = async (id, statut, message_reponse = '') => {
  const res = await API.put(`/traitants/demandes/${id}/repondre`, {
    statut,
    message_reponse
  });
  return res.data.data;
};

/**
 * Récupère le profil complet d'un patient (pour médecin)
 * @param {number} patientId - ID du patient
 * @returns {Promise<Object>}
 */
export const getPatientProfile = async (patientId) => {
  const res = await API.get(`/traitants/patient/${patientId}/profile`);
  return res.data.data;
};

/**
 * Supprime une relation médecin traitant (patient)
 * @param {number} medecinId - ID du médecin à supprimer
 * @returns {Promise<Object>}
 */
export const removeTraitant = async (medecinId) => {
  try {
    const response = await API.delete(`/traitants/remove/${medecinId}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du médecin traitant:', error);
    throw new Error('Impossible de supprimer le médecin traitant');
  }
};
/**
 * Médecin → retire un patient (relation médecin-patient)
 * @param {number} patientId - ID du patient à retirer
 */
export const removePatientRelation = async (patientId) => {
  const res = await API.delete(`/traitants/patients/${patientId}`);
  return res.data;
};

/**
 * Définit un médecin comme traitant principal (patient)
 * @param {number} medecinId - ID du médecin à définir comme principal
 * @returns {Promise<Object>}
 */
export const setTraitantPrincipal = async (medecinId) => {
  try {
    const response = await API.put(`/traitants/set-principal/${medecinId}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la définition du médecin traitant principal:', error);
    throw new Error('Impossible de définir le médecin traitant principal');
  }
};

// Export par défaut pour compatibilité

const traitantService = {
  getAllMedecins,
  requestTraitant,
  getMyTraitantRequests,
  getMyPatients,
  getMedecinStats,
  getMedecinPatients,
  getMyTraitants,
  cancelTraitantRequest,
  getDemandesPourMedecin,
  repondreDemandeTraitant,
  getPatientProfile,
  removeTraitant,
  setTraitantPrincipal,
  removePatientRelation
};

export default traitantService;

