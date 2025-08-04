// Script de test pour vérifier le chargement du profil médecin
// À exécuter dans la console du navigateur sur la page du profil médecin

console.log('🔍 Test de chargement du profil médecin');

// Simuler un appel API pour voir les données
fetch('/api/profile/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('📋 Données du profil récupérées:', data);
  
  if (data.success && data.data) {
    const profile = data.data;
    
    console.log('✅ Informations de base:');
    console.log('- Nom:', profile.nom);
    console.log('- Prénom:', profile.prenom);
    console.log('- Email:', profile.email);
    console.log('- Téléphone:', profile.telephone);
    console.log('- Photo:', profile.photo_profil);
    
    console.log('✅ Informations professionnelles:');
    console.log('- Numéro d\'ordre:', profile.numero_ordre);
    console.log('- Spécialité:', profile.specialite);
    console.log('- Sous-spécialités:', profile.sous_specialites);
    console.log('- Établissement:', profile.etablissements);
    console.log('- Adresse cabinet:', profile.adresse_cabinet);
    console.log('- Téléphone cabinet:', profile.telephone_cabinet);
    
    console.log('✅ Nouveaux champs ajoutés:');
    console.log('- Téléconsultation:', profile.teleconsultation);
    console.log('- Jours disponibles:', profile.jours_disponibles);
    console.log('- Durée consultation:', profile.duree_consultation);
    console.log('- Profil public:', profile.profil_public);
    console.log('- Visible recherche:', profile.visible_recherche);
    console.log('- Afficher avis:', profile.afficher_avis);
    
    console.log('✅ Bio et présentation:');
    console.log('- Description:', profile.description);
    console.log('- Diplôme:', profile.diplome);
    console.log('- Parcours:', profile.parcours_professionnel);
    console.log('- Langues:', profile.langues);
  } else {
    console.error('❌ Erreur dans la réponse:', data);
  }
})
.catch(error => {
  console.error('❌ Erreur lors du test:', error);
});
