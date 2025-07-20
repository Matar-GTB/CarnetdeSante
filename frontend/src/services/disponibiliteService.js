// frontend/services/disponibiliteService.js
import axios from 'axios';

const API = 'http://localhost:5000/api';

export const getHorairesTravail = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API}/horaires`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data;
};

export const updateHoraireJour = async (jour, data) => {
  const token = localStorage.getItem('token');
  const res = await axios.put(`${API}/horaires/${jour}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data;
};

export const deleteHoraireJour = async (jour) => {
  const token = localStorage.getItem('token');
  const res = await axios.delete(`${API}/horaires/${jour}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.message;
};

export const getIndisponibilites = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API}/indispos/medecin`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data;
};

export const createIndisponibilite = async (data) => {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API}/indispos`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data;
};

export const deleteIndisponibilite = async (id) => {
  const token = localStorage.getItem('token');
  const res = await axios.delete(`${API}/indispos/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.message;
};
