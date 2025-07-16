import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Connexion
export const login = async ({ email, mot_de_passe }) => {
  try {
    const res = await API.post('/auth/login', { email, mot_de_passe });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Erreur lors de la connexion' };
  }
};

// 📝 Inscription
export const register = async (formData) => {
  try {
    const res = await API.post('/auth/register', formData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Erreur lors de l’inscription' };
  }
};
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});