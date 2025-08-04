import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { checkAuthStatus, logout as logoutService } from '../services/authService';

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  loginContext: () => {},
  logout: () => {},
  updateUser: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await checkAuthStatus();
        if (response.success && response.data) {
          // Adapter la structure utilisateur pour tous les cas
          const userData = {
            id: response.data.id,
            email: response.data.email,
            role: response.data.role,
            prenom: response.data.prenom || response.data.firstName || '',
            nom: response.data.nom || response.data.lastName || response.data.name || '',
            nom_complet: response.data.nom_complet || `${response.data.prenom || ''} ${response.data.nom || ''}`.trim(),
            telephone: response.data.telephone || response.data.phone || '',
            date_naissance: response.data.date_naissance || response.data.birthDate || '',
            sexe: response.data.sexe || response.data.gender || '',
            // Champs spécifiques médecin
            specialite: response.data.specialite || '',
            numero_ordre: response.data.numero_ordre || '',
            accepte_nouveaux_patients: response.data.accepte_nouveaux_patients || false,
            // Champs spécifiques patient
            groupe_sanguin: response.data.groupe_sanguin || '',
            allergies: response.data.allergies || '',
            antecedents: response.data.antecedents || '',
            // Infos supplémentaires
            photo_profil: response.data.photo_profil || '',
            adresse: response.data.adresse || '',
            ville: response.data.ville || '',
            code_postal: response.data.code_postal || ''
          };
          
          setUser(userData);
          setToken(response.token || null);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('🍪 Non authentifié:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction pour connecter l'utilisateur (après succès login)
  const loginContext = useCallback((userData) => {
    // Même adaptation pour les données reçues à la connexion
    const adaptedUser = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      prenom: userData.prenom || userData.firstName || '',
      nom: userData.nom || userData.lastName || userData.name || '',
      nom_complet: userData.nom_complet || `${userData.prenom || ''} ${userData.nom || ''}`.trim(),
      telephone: userData.telephone || userData.phone || '',
      date_naissance: userData.date_naissance || userData.birthDate || '',
      sexe: userData.sexe || userData.gender || '',
      specialite: userData.specialite || '',
      numero_ordre: userData.numero_ordre || '',
      accepte_nouveaux_patients: userData.accepte_nouveaux_patients || false,
      groupe_sanguin: userData.groupe_sanguin || '',
      allergies: userData.allergies || '',
      antecedents: userData.antecedents || '',
      photo_profil: userData.photo_profil || '',
      adresse: userData.adresse || '',
      ville: userData.ville || '',
      code_postal: userData.code_postal || ''
    };
    
    setUser(adaptedUser);
    setToken(userData.token || null);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  // Fonction pour déconnecter l'utilisateur
  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  // Fonction pour mettre à jour l'utilisateur
  const updateUser = useCallback((updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, loginContext, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
