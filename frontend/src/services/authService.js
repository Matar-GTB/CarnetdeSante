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

// Intercepteur pour gérer les erreurs d'authentification
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('🚫 Erreur 401: Session expirée ou non authentifié');
      // Rediriger vers la page de connexion si nécessaire
      if (window.location.pathname !== '/auth/login') {
        console.log('🔄 Redirection vers la page de connexion...');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
