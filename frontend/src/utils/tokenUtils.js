// frontend/src/utils/tokenUtils.js
import {jwtDecode} from 'jwt-decode';

export const getTokenPayload = (token) => {
  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("Erreur de décodage du token", err);
    return null;
  }
};