// Navigation de test - Profils Patients Publics
// À utiliser dans la console du navigateur sur http://localhost:3000

// Fonction pour naviguer vers un profil patient
function goToPatientProfile(patientId) {
  window.location.href = `/patients/${patientId}/public`;
}

// Fonction pour tester les profils
function testPatientProfiles() {
  console.log('🧪 Tests disponibles pour les profils patients publics:');
  console.log('');
  console.log('📋 Patients de test disponibles:');
  console.log('  Patient 5 - Sophie Martin (confidentialité complète)');
  console.log('  Patient 6 - Jean Dubois (email public)');
  console.log('  Patient 7 - Marie Moreau (email + téléphone publics)');
  console.log('');
  console.log('🔗 Commandes:');
  console.log('  goToPatientProfile(5)  // -> Sophie');
  console.log('  goToPatientProfile(6)  // -> Jean');
  console.log('  goToPatientProfile(7)  // -> Marie');
  console.log('  goToPatientProfile(999) // -> Test erreur');
  console.log('');
  console.log('📱 Ou utilisez directement:');
  console.log('  http://localhost:3000/patients/5/public');
  console.log('  http://localhost:3000/patients/6/public');
  console.log('  http://localhost:3000/patients/7/public');
}

// Auto-exécuter pour afficher les infos
testPatientProfiles();

// Rendre les fonctions disponibles globalement
window.goToPatientProfile = goToPatientProfile;
window.testPatientProfiles = testPatientProfiles;

console.log('✅ Navigation de test chargée !');
