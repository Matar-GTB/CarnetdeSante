
// src/services/userService.js
import { API } from './authService';

// Fonction générique pour récupérer les utilisateurs par rôle
export const getUsersByRole = async (role) => {
  const res = await API.get(`/users?role=${role}`);
  return res.data;
};

// Raccourcis pour médecin et patient
export const getMedecins = () => getUsersByRole('medecin');
export const getPatients = () => getUsersByRole('patient');

// Fonction pour récupérer les patients d'un médecin spécifique
export const getMedecinPatients = async () => {
  try {
    const res = await API.get('/medecin/patients');
    return res.data.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des patients:', error);
    throw error;
  }
};

// Fonction pour récupérer les détails d'un patient
export const getPatientDetails = async (patientId) => {
  try {
    const res = await API.get(`/patients/${patientId}`);
    return res.data.data || null;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du patient:', error);
    throw error;
  }
};
