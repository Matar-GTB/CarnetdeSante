// frontend/src/services/profileService.js

import axios from 'axios';
export const API_BASE_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api/users';

// 🔹 Récupère toutes les infos du profil (personnelles + médicales)
export const getUserProfile = async (token) => {
  const res = await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data.data;
};

// 🔹 Met à jour les infos personnelles (hors photo)
export const updateUserProfile = async (token, profileData) => {
  const res = await axios.put(`${API_URL}/me`, profileData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data.data;
};

// 🔹 Met à jour le profil avec photo (multipart/form-data)
export const updateUserProfileWithPhoto = async (token, formData) => {
  const res = await axios.put(`${API_URL}/profile-with-photo`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data.data;
};
