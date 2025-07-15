// frontend/src/utils/tokenUtils.js

import { jwtDecode } from 'jwt-decode';

export const getTokenPayload = (token) => {
  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("Erreur de décodage du token", err);
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = getTokenPayload(token);
  if (!payload?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
};

export const getUserRole = (token) => {
  const payload = getTokenPayload(token);
  return payload?.role || null;
};
