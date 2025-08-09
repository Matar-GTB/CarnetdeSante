// frontend/src/services/consultationService.js
import { API } from './authService';

// Créer une consultation
export const createConsultation = async (data) => {
  const res = await API.post('/consultations', data);
  return res.data;
};

// Mettre à jour une consultation
export const updateConsultation = async (id, data) => {
  const res = await API.patch(`/consultations/${id}`, data);
  return res.data;
};

// Récupérer toutes les consultations d'un patient
export const getConsultationsByPatient = async (patientId) => {
  const res = await API.get(`/consultations/patient/${patientId}`);
  return res.data?.data || [];
};

// Récupérer une consultation par rendezvous
export const getConsultationByRendezvous = async (rendezvousId) => {
  const res = await API.get(`/consultations/rendezvous/${rendezvousId}`);
  return res.data?.data || null;
};
