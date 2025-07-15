// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getTokenPayload } from '../utils/tokenUtils';
import api from '../services/api';

export const AuthContext = createContext({
  token: null,
  role: null,
  login: async () => {},
  logout: () => {}
});

export function AuthProvider({ children }) {
  // --- État local du token et rôle ---
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole]   = useState(null);

  // --- 1️⃣ Hydratation initiale & test d'expiration à chaque changement de token ---
  useEffect(() => {
    if (!token) {
      setRole(null);
      return localStorage.removeItem('token');
    }

    const { exp, role } = getTokenPayload(token);
    if (Date.now() > exp * 1000) {
      // token déjà expiré
      setToken(null);
    } else {
      // token valide : on stocke et on met le rôle
      setRole(role);
      localStorage.setItem('token', token);
    }
  }, [token]);

  // --- 2️⃣ Synchronisation multi‐onglets via l'événement storage ---
  useEffect(() => {
    const handleStorage = e => {
      if (e.key === 'token') {
        setToken(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // --- 3️⃣ Rafraîchissement proactif 1 min avant expiration ---
  useEffect(() => {
    if (!token) return;

    const { exp } = getTokenPayload(token);
    const msBefore = exp * 1000 - Date.now() - 60_000; // 1 minute avant

    if (msBefore <= 0) {
      // si on est déjà passé, purge
      setToken(null);
      return;
    }

    const timerId = setTimeout(async () => {
      try {
        const { data } = await api.post('/auth/refresh-token', {}, { withCredentials: true });
        setToken(data.token);
      } catch {
        // si refresh échoue, on déconnecte
        setToken(null);
      }
    }, msBefore);

    return () => clearTimeout(timerId);
  }, [token]);

  // --- 4️⃣ Méthodes exposées pour login/logout ---
  const login = useCallback(newToken => {
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
