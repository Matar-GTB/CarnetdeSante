// src/services/disponibiliteService.js
import { API } from './authService'; // ✅ API unifiée

export const getHorairesTravail = async () => {
  const res = await API.get('/horaires');
  return res.data.data;
};

export const updateHoraireJour = async (jour, data) => {
  const res = await API.put(`/horaires/${jour}`, data);
  return res.data.data;
};

export const deleteHoraireJour = async (jour) => {
  const res = await API.delete(`/horaires/${jour}`);
  return res.data.message;
};

export const getIndisponibilites = async () => {
  const res = await API.get('/indispos/medecin');
  return res.data.data;
};

export const createIndisponibilite = async (data) => {
  const res = await API.post('/indispos', data);
  return res.data.data;
};

export const deleteIndisponibilite = async (id) => {
  const res = await API.delete(`/indispos/${id}`);
  return res.data.message;
};

// Export par défaut
const disponibiliteService = {
  getHorairesTravail,
  updateHoraireJour,
  deleteHoraireJour,
  getIndisponibilites,
  createIndisponibilite,
  deleteIndisponibilite
};

export default disponibiliteService;
