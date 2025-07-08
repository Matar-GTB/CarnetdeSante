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

// 📄 Récupérer tous les documents de l'utilisateur connecté
export const getUserDocuments = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("Token manquant dans localStorage");

  try {
    const response = await axios.get(`${API_BASE}/documents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (err) {
    console.error("Erreur axios Erreur getUserDocuments:", err.response?.data || err.message);
    throw err;
  }
};


// 📤 Upload d’un nouveau document avec FormData
export const uploadDocument = async (formData) => {
  const config = {
    headers: {
      ...getAuthHeaders().headers,
      'Content-Type': 'multipart/form-data'
    }
  };

  const response = await axios.post(`${API_BASE}/upload`, formData, config);
  return response.data;
};

// 📥 Télécharger un document par ID
export const downloadDocument = async (documentId) => {
  const config = {
    ...getAuthHeaders(),
    responseType: 'blob', // important pour télécharger un fichier
  };

  const response = await axios.get(`${API_BASE}/documents/${documentId}/download`, config);
  return response.data; // Blob à gérer dans le frontend
};
