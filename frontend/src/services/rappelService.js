import { API } from './authService';

// ✅ Ajoute manuellement le token dans chaque requête :

export const getRappelsApi = (token) =>
  API.get('/rappels', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

export const getRappelApi = (id, token) =>
  API.get(`/rappels/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

export const creerRappelApi = (data, token) =>
  API.post('/rappels', data, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

export const modifierRappelApi = (id, data, token) =>
  API.put(`/rappels/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

export const supprimerRappelApi = (id, token) =>
  API.delete(`/rappels/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

export const getHistoriqueRappelsApi = (token) =>
  API.get('/rappels/historique', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

export const supprimerRappelsMultiplesApi = (ids, token) =>
  API.post('/rappels/supprimer-multiples', { ids }, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
