import { jwtDecode } from 'jwt-decode';

/**
 * 🔓 Décode un token JWT (accessToken)
 */
export const getTokenPayload = (token) => {
  try {
    if (typeof token !== 'string') return null;
    return jwtDecode(token);
  } catch (err) {
    console.error("Erreur de décodage du token", err);
    return null;
  }
};

/**
 * 🔒 Vérifie si un token est expiré
 */
export const isTokenExpired = (token) => {
  const payload = getTokenPayload(token);
  if (!payload?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
};

/**
 * 🎭 Rôle extrait du token
 */
export const getUserRole = (token) => {
  const payload = getTokenPayload(token);
  return payload?.role || null;
};
