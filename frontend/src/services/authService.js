import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const login = async ({ email, mot_de_passe }) => {
  try {
    const res = await API.post('/auth/login', { email, mot_de_passe });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Erreur de connexion' };
  }
};

export const register = async (formData) => {
  try {
    const res = await API.post('/auth/register', formData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Erreur inscription' };
  }
};

export const verifyEmailWithCode = async (email, code) => {
  try {
    const res = await API.post('/auth/verify-email-code', { email, code });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Erreur de vérification du code' };
  }
};

export const resendVerificationCode = async (email) => {
  try {
    const res = await API.post('/auth/resend-verification-code', { email });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Erreur lors de l\'envoi du code' };
  }
};

export const checkAuthStatus = async () => {
  try {
    const res = await API.get('/auth/status');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Non authentifie' };
  }
};

export const logout = async () => {
  try {
    const res = await API.post('/auth/logout');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Erreur deconnexion' };
  }
};

// Ajout d'une fonction pour rafraîchir explicitement le token
export const refreshToken = async () => {
  try {
    const res = await API.post('/auth/refresh-token');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Erreur de rafraîchissement du token' };
  }
};

export default API;
