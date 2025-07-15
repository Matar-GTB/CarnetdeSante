// src/services/documentService.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/medical';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  };
};

function getFilename(disposition) {
  if (!disposition) return 'document';
  const match = disposition.match(/filename="?(.+)"?/);
  return match ? match[1] : 'document';
}

/**
 * Liste tous les documents de l’utilisateur connecté
 */
export const getUserDocuments = async () => {
  const res = await axios.get(`${API_BASE}/documents`, getAuthHeaders());
  return res.data;  // assume API renvoie { data: [...] } ou directement [...]
};

/**
 * Upload d’un document (FormData)
 */
export const uploadDocument = async (formData) => {
  const res = await axios.post(
    `${API_BASE}/upload`,
    formData,
    {
      ...getAuthHeaders(),
      headers: {
        ...getAuthHeaders().headers,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return res.data;
};

/**
 * Suppression d’un document
 */
export const deleteDocument = async (documentId) => {
  await axios.delete(
    `${API_BASE}/documents/${documentId}`,
    getAuthHeaders()
  );
};

/**
 * Téléchargement d’un document (blob + nom de fichier)
 */
export const downloadDocument = async (documentId) => {
  const { data: blob, headers } = await axios.get(
    `${API_BASE}/documents/${documentId}/download`,
    {
      ...getAuthHeaders(),
      responseType: 'blob'
    }
  );
  const filename = getFilename(headers['content-disposition']);
  return { blob, filename };
};
