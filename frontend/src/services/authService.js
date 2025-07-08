import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
});


export const login = async ({ email, mot_de_passe }) => {
  console.log({ email, mot_de_passe });
  const res = await API.post('/login', { email, mot_de_passe });
  return res.data;
};

export const register = async (formData) => {
  const res = await API.post('/register', formData);
  return res.data;
};
