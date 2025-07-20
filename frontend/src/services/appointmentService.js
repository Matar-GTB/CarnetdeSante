// src/services/appointmentService.js
import api from './api';

// 1) Récupérer les médecins traitants
export const getMedecinsTraitants = async () => {
  const res = await api.get('/appointments/traitants');
  return res.data.data;
};

// 2) Récupérer tous les médecins disponibles
export const getMedecinsDisponibles = async () => {
  const res = await api.get('/appointments/disponibles');
  return res.data.data;
};

// 3) Créer une demande de rendez-vous
export const createAppointment = async (payload) => {
  const res = await api.post('/appointments', payload);
  return res.data.data;
};

// 4) Le médecin accepte une demande
export const acceptAppointment = async (id) => {
  const res = await api.patch(`/appointments/${id}/accept`);
  return res.data.data;
};

// 5) Récupérer les rendez-vous d’un utilisateur
export const getAppointmentsByUser = async (userId) => {
  const res = await api.get(`/appointments/user/${userId}`);
  return res.data.data;
};

// 6) Annuler / supprimer un rendez-vous
export const deleteAppointment = async (id) => {
  await api.delete(`/appointments/${id}`);
  return true;
};
//Refus
export const refuseAppointment = async (id) => {
  const res = await api.patch(`/appointments/${id}/refuse`);
  return res.data.data;
};
//8
export const cancelAppointment = async (id, message) => {
  const res = await api.patch(`/appointments/${id}/cancel`, { message });
  return res.data.data;
};
// 9) Récupérer les créneaux disponibles d’un médecin pour une date donnée
export const getCreneauxDisponibles = async (medecinId, date) => {
  const res = await api.get(`/appointments/${medecinId}/disponibles/${date}`);
  return res.data.data;
};
