import { jwtDecode } from 'jwt-decode';


/**
 * 🔐 Récupère et décode le token depuis le localStorage
 */
export const getTokenPayloadFromStorage = () => {
  const token = localStorage.getItem('token');
  if (!token || typeof token !== 'string') return null;

  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("Erreur de décodage du token", err);
    return null;
  }
};

/**
 * 🎯 Décode un token donné
 */
export const getTokenPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
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
