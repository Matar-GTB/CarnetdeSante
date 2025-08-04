// src/services/documentService.js
import { API } from './authService'; //  API unifiée

function getFilename(disposition) {
  if (!disposition) return 'document';
  const match = disposition.match(/filename="?(.+)"?/);
  return match ? match[1] : 'document';
}

/**
 * Liste tous les documents de l'utilisateur connecté
 */
export const getUserDocuments = async () => {
  const res = await API.get('/medical/documents');
  return res.data;  // assume API renvoie { data: [...] } ou directement [...]
};

/**
 * Upload d'un document (FormData)
 */
export const uploadDocument = async (formData) => {
  const res = await API.post('/medical/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

/**
 * Suppression d'un document
 */
export const deleteDocument = async (documentId) => {
  await API.delete(`/medical/documents/${documentId}`);
};

/**
 * Téléchargement d'un document (blob + nom de fichier)
 */
export const downloadDocument = async (documentId) => {
  const { data: blob, headers } = await API.get(
    `/medical/documents/${documentId}/download`,
    {
      responseType: 'blob'
    }
  );
  const filename = getFilename(headers['content-disposition']);
  return { blob, filename };
};
