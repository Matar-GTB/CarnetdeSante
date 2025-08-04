// src/services/debugAuth.js - Service de debug pour l'authentification

import { API, checkAuthStatus } from './authService';

export const debugAuthStatus = async () => {
  console.log('🔍 DEBUG: Vérification de l\'état d\'authentification...');
  
  try {
    // Vérifier les cookies
    console.log('🍪 Cookies actuels:', document.cookie);
    
    // Tester la route de statut
    const response = await checkAuthStatus();
    console.log('✅ Statut auth:', response);
    
    return {
      success: true,
      authenticated: true,
      user: response.data
    };
    
  } catch (error) {
    console.error('❌ Erreur authentification:', error);
    
    // Détails de l'erreur
    if (error.response) {
      console.error('📄 Réponse serveur:', error.response.data);
      console.error('🔢 Code statut:', error.response.status);
    }
    
    return {
      success: false,
      authenticated: false,
      error: error.response?.data || error.message
    };
  }
};

export const debugAPICall = async (endpoint) => {
  console.log(`🔍 DEBUG: Test d'appel API vers ${endpoint}...`);
  
  try {
    const response = await API.get(endpoint);
    console.log(`✅ Succès ${endpoint}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur ${endpoint}:`, error);
    
    if (error.response?.status === 401) {
      console.error('🚫 Erreur 401: Non authentifié - Vérifiez votre connexion');
    }
    
    throw error;
  }
};

export const testAuthentication = async () => {
  console.log('🧪 TEST COMPLET D\'AUTHENTIFICATION');
  console.log('=====================================');
  
  // Test 1: Vérifier l'état d'auth
  const authStatus = await debugAuthStatus();
  
  if (!authStatus.authenticated) {
    console.log('❌ Utilisateur non authentifié');
    return false;
  }
  
  // Test 2: Tester un appel API protégé
  try {
    await debugAPICall('/medications');
    console.log('✅ API medications accessible');
    return true;
  } catch (error) {
    console.log('❌ API medications inaccessible');
    return false;
  }
};
