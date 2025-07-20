import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getTokenPayload } from '../utils/tokenUtils';
import api from '../services/api';

export const AuthContext = createContext({
  token: null,
  role: null,
  user: null,
  loginContext: async () => {},
  logout: () => {}
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // 1️⃣ Vérifie le token au chargement ou à chaque changement
  useEffect(() => {
    if (!token) {
      setRole(null);
      return localStorage.removeItem('token');
    }

    const { exp, role } = getTokenPayload(token);
    if (Date.now() > exp * 1000) {
      setToken(null); // expiré
    } else {
      setRole(role);
      localStorage.setItem('token', token);
    }
  }, [token]);

  // 1️⃣bis : Charge les infos utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/me');
        if (data.success) setUser(data.data);
      } catch (err) {
        console.error('Erreur chargement profil :', err);
        setUser(null); // ex: 401
      }
    };

    if (token) fetchProfile();
    else setUser(null);
  }, [token]);

  // 2️⃣ Synchronisation multi‐onglets
  useEffect(() => {
    const handleStorage = e => {
      if (e.key === 'token') {
        setToken(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // 3️⃣ Rafraîchissement proactif
  useEffect(() => {
    if (!token) return;

    const { exp } = getTokenPayload(token);
    const msBefore = exp * 1000 - Date.now() - 60_000;

    if (msBefore <= 0) {
      setToken(null);
      return;
    }

    const timerId = setTimeout(async () => {
      try {
        const { data } = await api.post('/auth/refresh-token', {}, { withCredentials: true });
        setToken(data.token);
      } catch {
        setToken(null); // refresh échoué
      }
    }, msBefore);

    return () => clearTimeout(timerId);
  }, [token]);

  // 4️⃣ Méthodes de login / logout
  const loginContext = useCallback(newToken => {
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, user, loginContext, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
