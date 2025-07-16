// src/services/rappelService.js
// Ce fichier gère les appels API pour les rappels programmés

import { API } from './authService';

/**
 * Récupère la liste des rappels programmés de l'utilisateur
 */
export const getRappelsApi = () =>
  API.get('/rappels')
    .then(res => res.data);

/**
 * Récupère un rappel par son ID
 */
export const getRappelApi = id =>
  API.get(`/rappels/${id}`)
    .then(res => res.data);

/**
 * Crée un nouveau rappel
 * @param {object} data - { type_rappel, details, recurrence, canaux }
 */
export const creerRappelApi = data =>
  API.post('/rappels', data)
    .then(res => res.data);

/**
 * Modifie un rappel existant
 * @param {number} id
 * @param {object} data - mêmes champs que pour la création
 */
export const modifierRappelApi = (id, data) =>
  API.put(`/rappels/${id}`, data)
    .then(res => res.data);

/**
 * Supprime un rappel
 * @param {number} id
 */
export const supprimerRappelApi = id =>
  API.delete(`/rappels/${id}`)
    .then(res => res.data);
