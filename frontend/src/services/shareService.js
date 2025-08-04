// src/services/shareService.js
import { API } from './authService'; // ✅ API unifiée

export const generateShareLink = async ({ selectedDocs, medecinId, dureeEnHeures = 24 }) => {
  const res = await API.post('/sharing/generate', {
    documents: selectedDocs,
    medecin_id: medecinId,
    duree_heures: dureeEnHeures
  });
  return res.data;
};

export const getSharedDocs = async (shareToken) => {
  const res = await API.get(`/sharing/${shareToken}`);
  return res.data;
};
