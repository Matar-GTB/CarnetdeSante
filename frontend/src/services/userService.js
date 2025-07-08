import axios from 'axios';

export const getMedecins = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('http://localhost:5000/api/users?role=medecin', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};
