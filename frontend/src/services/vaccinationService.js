import { API } from './authService';

const API_URL = '/medical/vaccinations';  // baseURL déjà préfixée par api

export const getVaccinations = async (patientId = null) => {
  const url = patientId ? `${API_URL}?patientId=${patientId}` : API_URL;
  const { data } = await API.get(url);
  return data;
};
export const addVaccination = async (vaccinData) => {
  const { data } = await API.post(API_URL, vaccinData);
  return data;
};

export const deleteVaccination = async (id) => {
  const { data } = await API.delete(`${API_URL}/${id}`);
  return data;
};

export const updateVaccination = async (id, vaccinData) => {
  const { data } = await API.put(`${API_URL}/${id}`, vaccinData);
  return data;
};

export const getStatistiquesVaccination = async () => {
  const { data } = await API.get(`${API_URL}/statistiques`);
  return data;
};

export const getCalendrierVaccinal = async (mois, annee) => {
  const { data } = await API.get(`${API_URL}/calendrier?mois=${mois}&annee=${annee}`);
  return data;
};

export const updatePreferencesNotification = async (preferences) => {
  const { data } = await API.put(`${API_URL}/preferences-notification`, { preferences });
  return data;
};
