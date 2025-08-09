// src/services/profileService.js
import axios from 'axios';
import { API } from './authService';
import { getAppointmentsByUser } from './appointmentService';
import { getMedicationsApi } from './medicationService';

/**
 * Met à jour les paramètres de visibilité du profil
 * @param {Object} visibilitySettings - Paramètres de visibilité par champ
 * @returns {Promise<Object>} Résultat de la mise à jour
 */

const API_URL = 'http://localhost:5000/api'; 

/**
 * Récupère les médecins traitants du patient connecté
 * @returns {Promise<Array>}
 */
export const getMesTraitants = async () => {
  try {
    const res = await API.get('/traitants/mes-traitants');
    return {
      success: true,
      data: res.data.data || []
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des médecins traitants:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Erreur lors de la récupération des médecins traitants'
    };
  }
};

/**
 * Récupère le profil complet de l'utilisateur connecté
 * @returns {Promise<Object>}
 */
export const getMyProfile = async () => {
  try {
    const res = await API.get('/profile/me');
    
    // Adapter la réponse pour correspondre à la structure attendue
    const userData = res.data.data;
    
    return {
      success: true,
      data: {
        profile: userData,
        visibility: userData.visibility || {},
        settings: userData.settings || {},
        emergencyLink: userData.emergency_link || ''
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Met à jour le profil de l'utilisateur connecté
 * @param {Object} profileData - Données du profil à mettre à jour
 * @returns {Promise<Object>}
 */
export const updateMyProfile = async (profileData) => {
  try {
    console.log('🔄 Envoi de la mise à jour du profil:', profileData);
    const res = await API.put('/profile/me', profileData);
    console.log('✅ Réponse de la mise à jour du profil:', res.data);
    
    return {
      success: true,
      data: res.data.data,
      message: res.data.message || 'Profil mis à jour avec succès'
    };
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error);
    console.error('Erreur lors de la sauvegarde:', error);
    console.error('Détails de l\'erreur:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du profil'
    };
  }
};




/**
 * Génère un lien d'urgence sécurisé
 * @param {number} durationHours - Durée de validité en heures (défaut: 24h)
 * @returns {Promise<Object>} - { token, url, expires_at }
 */
export const generateEmergencyLink = async (durationHours = 24) => {
  const res = await API.post('/profile/emergency/generate', { durationHours });
  return res.data.data;
};

/**
 * Récupère le profil d'urgence via un token
 * @param {string} patientId - ID du patient
 * @param {string} token - Token d'urgence
 * @returns {Promise<Object>}
 */
export const getEmergencyProfile = async (patientId, token) => {
  const res = await API.get(`/profile/emergency/${patientId}/${token}`);
  return res.data.data;
};

/**
 * Désactive un lien d'urgence
 * @returns {Promise<Object>}
 */
export const revokeEmergencyLink = async () => {
  const res = await API.delete('/profile/emergency/revoke');
  return res.data;
};

/**
 * Récupère les statistiques du profil
 * @returns {Promise<Object>}
 */
export const getProfileStats = async () => {
  const res = await API.get('/profile/stats');
  return res.data.data;
};

/**
 * Récupère le profil public d'un médecin
 * @param {number} medecinId - ID du médecin
 * @returns {Promise<Object>}
 */
/**
 * Récupère le profil public d'un médecin (nouvelle route harmonisée)
 * @param {number} medecinId - ID du médecin
 * @returns {Promise<Object>}
 */
export const getMedecinPublicProfile = async (medecinId) => {
  try {
    // Utilisation de la route réellement implémentée et fonctionnelle
    const res = await API.get(`/users/doctors/${medecinId}/public`);
    return {
      success: true,
      data: res.data.data || res.data
    };
  } catch (error) {
    console.error('Erreur lors du chargement du profil public médecin:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Erreur lors de la récupération du profil public du médecin'
    };
  }
};

/**
 * Récupère le profil public d'un patient (très limité)
 * @param {number} patientId - ID du patient
 * @returns {Promise<Object>}
 */
export const getPatientPublicProfile = async (patientId) => {
  console.log('🔍 Début getPatientPublicProfile - patientId:', patientId);
  
  if (!patientId) {
    console.error('❌ ID patient manquant');
    return {
      success: false,
      message: 'ID patient manquant'
    };
  }

  try {
    console.log('📡 Appel API:', `/profile/patient/${patientId}/public`);
    const res = await API.get(`/profile/patient/${patientId}/public`);
    console.log('✅ Réponse API reçue:', res);
    
    if (!res.data || (!res.data.data && !res.data.success)) {
      return {
        success: false,
        message: 'Profil non trouvé ou inaccessible'
      };
    }
    
    return {
      success: true,
      data: res.data.data || res.data
    };
  } catch (error) {
    console.error('❌ Erreur API:', error.response || error);
    
    // Gestion spécifique des erreurs HTTP
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return {
            success: false,
            message: 'Patient non trouvé'
          };
        case 403:
          return {
            success: false,
            message: 'Accès non autorisé'
          };
        default:
          return {
            success: false,
            message: error.response.data?.message || 'Erreur lors du chargement du profil'
          };
      }
    }
    
    return {
      success: false,
      message: 'Patient non trouvé ou inaccessible'
    };
  }
};

/**
 * Upload d'une photo de profil
 * @param {File} file - Fichier image
 * @returns {Promise<Object>}
 */
export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  const res = await API.put('/users/profile-with-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data.data;
};

/**
 * Met à jour le profil utilisateur avec photo (version avec token explicite)
 * @param {string} token - Token d'authentification
 * @param {FormData} formData - Données du formulaire avec photo
 * @returns {Promise<Object>}
 */
export const updateUserProfileWithPhoto = async (token, formData) => {
  const res = await axios.put(`${API_URL}/users/profile-with-photo`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data.data;
};

/**
 * Supprime la photo de profil
 * @returns {Promise<Object>}
 */
export const deleteProfilePhoto = async () => {
  const res = await API.delete('/users/profile/photo');
  return res.data.data;
};

/**
 * Récupère l'historique des connexions d'urgence
 * @returns {Promise<Array>}
 */
export const getEmergencyAccessHistory = async () => {
  const res = await API.get('/users/profile/emergency/history');
  return res.data.data;
};

/**
 * Met à jour les informations médicales d'urgence
 * @param {Object} emergencyData - Données médicales d'urgence
 * @returns {Promise<Object>}
 */
export const updateEmergencyMedicalInfo = async (emergencyData) => {
  const res = await API.put('/users/profile/emergency/medical', emergencyData);
  return res.data.data;
};

/**
 * Définit un médecin traitant comme principal
 * @param {number} medecinId - ID du médecin
 * @returns {Promise<Object>}
 */
export const setTraitantPrincipal = async (medecinId) => {
  const res = await API.put(`/traitants/${medecinId}/set-principal`);
  return res.data.data;
};

/**
 * Retire un médecin traitant
 * @param {number} medecinId - ID du médecin
 * @returns {Promise<Object>}
 */
export const removeTraitant = async (medecinId) => {
  const res = await API.delete(`/traitants/${medecinId}`);
  return res.data.data;
};

/**
 * Retire un patient de la liste du médecin
 * @param {number} patientId - ID du patient
 * @returns {Promise<Object>}
 */
export const removePatient = async (patientId) => {
  const res = await API.delete(`/traitants/patient/${patientId}`);
  return res.data.data;
};

/**
 * Recherche de médecins dans l'annuaire
 * @param {Object} searchParams - Paramètres de recherche
 * @returns {Promise<Array>}
 */
export const searchDoctors = async (searchParams) => {
  const res = await API.get('/users/doctors/search', { params: searchParams });
  return res.data.data;
};

/**
 * Récupère les informations publiques d’un médecin par son ID (ex. médecin traitant)
 * @param {number} medecinId 
 * @returns {Promise<Object>}
 */
export const getMedecinTraitant = async (medecinId) => {
  const res = await API.get(`/users/medecin/${medecinId}/public`);
  return res.data;
};

/**
 * Récupère les rendez-vous du patient
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export const getPatientRendezVous = async (userId) => {
  const data = await getAppointmentsByUser(userId);
  return { success: true, data };
};

/**
 * Récupère les médicaments du patient
 * @returns {Promise<Object>}
 */
export const getPatientMedications = async () => {
  const data = await getMedicationsApi();
  return { success: true, data };
};

const profileService = {
  getMyProfile,
  updateMyProfile,
  generateEmergencyLink,
  getEmergencyProfile,
  revokeEmergencyLink,
  getMedecinPublicProfile,
  getMedecinTraitant, 
  getPatientPublicProfile,
  uploadProfilePhoto,
  updateUserProfileWithPhoto,
  deleteProfilePhoto,
  getEmergencyAccessHistory,
  updateEmergencyMedicalInfo,
  setTraitantPrincipal,
  removeTraitant,
  removePatient,
  searchDoctors,
  getPatientRendezVous,
  getPatientMedications,
  getMesTraitants,
};

export default profileService;