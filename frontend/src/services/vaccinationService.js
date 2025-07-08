import axios from 'axios';

const API_URL = 'http://localhost:5000/api/medical/vaccinations';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

// 🔍 Récupérer les vaccins du patient connecté OU d’un patient ciblé (médecin)
export const getVaccinations = async (patientId = null) => {
  const url = patientId ? `${API_URL}?patientId=${patientId}` : API_URL;
  const res = await axios.get(url, getAuthHeaders());
  return res.data;
};

// ➕ Ajouter un vaccin (seulement pour le patient connecté)
export const addVaccination = async (vaccinData) => {
  const res = await axios.post(API_URL, vaccinData, getAuthHeaders());
  return res.data;
};

// ❌ Supprimer un vaccin (autorisé uniquement pour le patient lui-même)
export const deleteVaccination = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return res.data;
};
