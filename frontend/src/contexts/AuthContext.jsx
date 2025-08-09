import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { checkAuthStatus, logout as logoutService, API } from '../services/authService';

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
  const refreshTimerRef = useRef(null);
  const refreshingRef = useRef(false);

  // Fonction pour rafraîchir silencieusement le token
  const silentRefresh = useCallback(async () => {
    // Éviter les appels parallèles de refresh
    if (refreshingRef.current) return;
    
    try {
      refreshingRef.current = true;
      console.log('🔄 Rafraîchissement silencieux du token...');
      await API.post('/auth/refresh-token');
      console.log('✅ Token rafraîchi avec succès');
    } catch (error) {
      console.error('❌ Échec du rafraîchissement silencieux:', error);
    } finally {
      refreshingRef.current = false;
    }
  }, []);

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

  // Effet pour le rafraîchissement périodique du token (toutes les 10 minutes)
  useEffect(() => {
    const startRefreshTimer = () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }

      // Ping toutes les 10 minutes pour garder la session active
      refreshTimerRef.current = setInterval(() => {
        if (isAuthenticated) {
          silentRefresh();
        }
      }, 10 * 60 * 1000); // 10 minutes
    };

    if (isAuthenticated) {
      startRefreshTimer();
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [isAuthenticated, silentRefresh]);

  // Effet pour le rafraîchissement au retour de focus sur la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        console.log('🔍 Fenêtre récupère le focus, vérification du token...');
        silentRefresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, silentRefresh]);

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

  // Configuration de l'intercepteur Axios pour le refresh automatique
  useEffect(() => {
    // Mémoriser les requêtes en échec pour les rejouer après refresh
    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, token = null) => {
      failedQueue.forEach(prom => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token);
        }
      });
      
      failedQueue = [];
    };

    // Intercepteur de requête
    const requestInterceptor = API.interceptors.request.use(
      config => {
        // Ajout d'une méthode pour indiquer si cette requête est un retry
        if (!config._retry) {
          config._retry = false;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Intercepteur de réponse
    const responseInterceptor = API.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // Si c'est déjà un retry ou pas une erreur d'auth, on propage l'erreur
        if (originalRequest._retry || ![401, 403].includes(error.response?.status)) {
          return Promise.reject(error);
        }
        
        // Si on est déjà en train de rafraîchir, on met en file d'attente
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            return API(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // Tentative de refresh
        try {
          await silentRefresh();
          
          // Succès : on traite la file d'attente
          processQueue(null);
          isRefreshing = false;
          
          // Rejouer la requête originale
          return API(originalRequest);
        } catch (refreshError) {
          // Échec : on traite la file d'attente avec l'erreur
          processQueue(refreshError);
          isRefreshing = false;
          
          // Si on n'est pas déjà sur la page de login, on y va
          if (window.location.pathname !== '/auth/login') {
            console.log('❌ Session expirée, redirection vers login');
            logout();
            window.location.href = '/auth/login';
          }
          
          return Promise.reject(refreshError);
        }
      }
    );

    // Nettoyage à la démontage
    return () => {
      API.interceptors.request.eject(requestInterceptor);
      API.interceptors.response.eject(responseInterceptor);
    };
  }, [silentRefresh, logout]);

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
