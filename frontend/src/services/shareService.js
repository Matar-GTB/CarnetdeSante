import axios from 'axios';

const API_URL = 'http://localhost:5000/api/sharing';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  };
};

export const generateShareLink = async ({ selectedDocs, medecinId, dureeEnHeures = 24 }) => {
  const res = await axios.post(`${API_URL}/generate`, {
    selectedDocs,
    medecinId,
    dureeEnHeures
  }, getAuthHeaders());

  return res.data;
};
