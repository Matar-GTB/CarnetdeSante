// Test simple pour vérifier les données du profil
import { getMyProfile } from '../services/profileService.js';

const testProfile = async () => {
  try {
    console.log('🔄 Test de récupération du profil...');
    
    const result = await getMyProfile();
    console.log('📊 Résultat:', result);
    
    if (result.success) {
      console.log('✅ Profil récupéré avec succès');
      console.log('👤 Données utilisateur:', result.data.profile);
    } else {
      console.log('❌ Échec de récupération du profil:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error);
  }
};

// Export pour utilisation
export { testProfile };

// Auto-exécution si appelé directement
if (typeof window !== 'undefined') {
  window.testProfile = testProfile;
  console.log('🧪 Test disponible via window.testProfile()');
}
