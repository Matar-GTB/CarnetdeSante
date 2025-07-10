import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Connexion
export const login = async ({ email, mot_de_passe }) => {
  try {
    const res = await API.post('/login', { email, mot_de_passe });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Erreur lors de la connexion' };
  }
};

// 📝 Inscription
export const register = async (formData) => {
  try {
    const res = await API.post('/register', formData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Erreur lors de l’inscription' };
  }
};
