// src/services/appointmentService.js
import { API } from './authService';

// 1) Créer une demande de rendez-vous
export const createAppointment = async (payload) => {
  try {
    const res = await API.post('/appointments', payload);
    return res.data;
  } catch (error) {
    console.error('Erreur création RDV:', error);
    throw error;
  }
};

// 2) Récupérer les rendez-vous d'un utilisateur
export const getAppointmentsByUser = async (userId) => {
  try {
    const res = await API.get(`/appointments/user/${userId}`);
    return res.data?.data || [];
  } catch (error) {
    console.error('Erreur récupération RDV:', error);
    throw error;
  }
};

// 3) Récupérer les créneaux disponibles d'un médecin pour une date donnée
export const getCreneauxDisponibles = async (medecinId, date) => {
  try {
    const res = await API.get(`/appointments/${medecinId}/disponibles/${date}`);
    return res.data;
  } catch (error) {
    console.error('Erreur créneaux disponibles:', error);
    throw error;
  }
};

// 4) Annuler un rendez-vous
export const cancelAppointment = async (id, message = '') => {
  try {
    const res = await API.patch(`/appointments/${id}/cancel`, { message });
    return res.data;
  } catch (error) {
    console.error('Erreur annulation RDV:', error);
    throw error;
  }
};

// 5) Le médecin accepte une demande
export const acceptAppointment = async (id) => {
  try {
    const res = await API.patch(`/appointments/${id}/accept`);
    return res.data;
  } catch (error) {
    console.error('Erreur acceptation RDV:', error);
    throw error;
  }
};

// 6) Le médecin refuse une demande
export const refuseAppointment = async (id, message = '') => {
  try {
    const res = await API.patch(`/appointments/${id}/refuse`, { message });
    return res.data;
  } catch (error) {
    console.error('Erreur refus RDV:', error);
    throw error;
  }
};

// 7) Supprimer définitivement un rendez-vous (admin/médecin uniquement)
export const deleteAppointment = async (id) => {
  try {
    await API.delete(`/appointments/${id}`);
    return true;
  } catch (error) {
    console.error('Erreur suppression RDV:', error);
    throw error;
  }
};

// 8) Récupérer les médecins traitants d'un patient
export const getMedecinsTraitants = async () => {
  try {
    const res = await API.get('/appointments/traitants');
    return res.data?.data || [];
  } catch (error) {
    console.error('Erreur médecins traitants:', error);
    throw error;
  }
};

// 9) Récupérer tous les médecins disponibles pour RDV
export const getMedecinsDisponibles = async () => {
  try {
    const res = await API.get('/appointments/disponibles');
    return res.data?.data || [];
  } catch (error) {
    console.error('Erreur médecins disponibles:', error);
    throw error;
  }
};

// 10) Récupérer les statistiques des RDV d'un patient
export const getAppointmentStats = async (userId) => {
  try {
    const res = await API.get(`/appointments/user/${userId}/stats`);
    return res.data?.data || {};
  } catch (error) {
    console.error('Erreur stats RDV:', error);
    return {};
  }
};
