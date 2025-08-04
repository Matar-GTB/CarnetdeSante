// Script de test pour déboguer la recherche
console.log('🔍 Test de la fonction de recherche...');

// Simuler des données de médecins
const medecins = [
  { id: 1, prenom: 'Jean', nom: 'Dupont', specialite: 'Cardiologue', etablissements: 'Hôpital Central' },
  { id: 2, prenom: 'Marie', nom: 'Martin', specialite: 'Dermatologie', etablissements: 'Clinique des Roses' },
  { id: 3, prenom: 'Pierre', nom: 'Bernard', specialite: 'Neurologie', etablissements: 'Centre Médical' }
];

// Fonction de filtrage (extraite du composant)
function filterMedecins(medecins, search) {
  if (!search.trim()) return medecins;
  
  const query = search.toLowerCase().trim();
  return medecins.filter(m => {
    if (!m) return false;
    const nom = `${m.prenom || ''} ${m.nom || ''}`.toLowerCase();
    const specialite = (m.specialite || '').toLowerCase();
    const etablissement = (m.etablissements || '').toLowerCase();
    
    return nom.includes(query) || 
           specialite.includes(query) || 
           etablissement.includes(query);
  });
}

// Tests
console.log('📋 Données originales:', medecins);
console.log('🔍 Recherche "jean":', filterMedecins(medecins, 'jean'));
console.log('🔍 Recherche "cardio":', filterMedecins(medecins, 'cardio'));
console.log('🔍 Recherche "hôpital":', filterMedecins(medecins, 'hôpital'));
console.log('✅ Tests terminés');
