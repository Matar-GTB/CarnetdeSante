import { API } from './authService';

export const getMedicationsApi = () =>
  API.get('/medications').then(res => res.data.data);

export const addMedicationApi = (data) =>
  API.post('/medications', data).then(res => res.data);

export const updateMedicationApi = (id, data) =>
  API.put(`/medications/${id}`, data).then(res => res.data);

export const deleteMedicationApi = (id) =>
  API.delete(`/medications/${id}`).then(res => res.data);
