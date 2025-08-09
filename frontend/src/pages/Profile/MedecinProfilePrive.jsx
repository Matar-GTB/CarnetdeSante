// pages/Profile/MedecinProfilePrive.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import traitantService from '../../services/traitantService';
import profileService from '../../services/profileService';
import UserProfile from '../../components/profile/UserProfile';
import MedecinPersonalSection from '../../components/profile/sections/MedecinPersonalSection';
import DisponibiliteSection from '../../components/profile/sections/DisponibiliteSection';
import './MedecinProfilePrive.css';

const MedecinProfilePrive = () => {
  const { user, updateUser } = useContext(AuthContext);
  
  const [profileData, setProfileData] = useState({
    // Informations personnelles
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    photo_profil: '',
    date_naissance: '',
    
    // Informations professionnelles
    numero_ordre: '',
    specialite: '',
    sous_specialites: '',
    etablissement: '',
    adresse_cabinet: '',
    telephone_cabinet: '',
    
    // Disponibilités
    horaires_consultation: '',
    jours_disponibles: '',
    duree_consultation: 30,
    
    // Préférences
    accepte_nouveaux_patients: true,
    consultations_urgence: false,
    
    // Bio et présentation
    bio: '',
    formations: '',
    experience: '',
    certifications: '',
    langues_parlees: '',
    
    // Paramètres de visibilité
    profil_public: false,
    visible_recherche: true,
    afficher_avis: true
  });
  
  const [fieldsVisibility, setFieldsVisibility] = useState({});
  const [globalSettings, setGlobalSettings] = useState({
    profil_visible_patients: true,
    autoriser_demandes_rdv: true,
    notifications_actives: true,
    partage_avec_confreres: false
  });
  
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientSortBy, setPatientSortBy] = useState('nom'); // nom, age, derniere_consultation
  const [statistics, setStatistics] = useState({
    total_patients: 0,
    rdv_ce_mois: 0,
    note_moyenne: 0,
    avis_total: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('informations');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // État pour contrôler le mode édition de chaque section
  const [editModes, setEditModes] = useState({
    informations: false,
    professionnel: false,
    disponibilites: false,
    presentation: false,
    visibilite: false
  });
  useEffect(() => {
    const loadMedecinProfile = async () => {
      try {
        setLoading(true);
        
        if (user && user.id) {
          // Charger le profil depuis la base de données
          const profileResponse = await profileService.getMyProfile();
          if (profileResponse.success) {
            const profile = profileResponse.data.profile; // Accès correct aux données du profil
            console.log('📋 Données du profil chargées:', profile);
            
            setProfileData({
              // Informations personnelles
              nom: profile.nom || '',
              prenom: profile.prenom || '',
              email: profile.email || '',
              telephone: profile.telephone || '',
              photo_profil: profile.photo_profil || '',
              date_naissance: profile.date_naissance || '',
              
              // Informations professionnelles
              numero_ordre: profile.numero_ordre || '',
              specialite: profile.specialite || '',
              sous_specialites: profile.sous_specialites || '',
              etablissement: profile.etablissements || '', // établissements (DB) -> etablissement (frontend)
              adresse_cabinet: profile.adresse_cabinet || '',
              telephone_cabinet: profile.telephone_cabinet || '',
              
              // Disponibilités
              horaires_consultation: profile.horaires_travail || '',
              jours_disponibles: profile.jours_disponibles || '',
              duree_consultation: profile.duree_consultation || 30,
              
              // Préférences
              accepte_nouveaux_patients: profile.accepte_nouveaux_patients !== false,
              consultations_urgence: profile.accepte_non_traitants || false,
              teleconsultation: profile.teleconsultation || false,
              
              // Bio et présentation
              bio: profile.description || '', // description (DB) -> bio (frontend)
              formations: profile.diplome || '', // diplome (DB) -> formations (frontend)
              experience: profile.parcours_professionnel || '', // parcours_professionnel (DB) -> experience (frontend)
              certifications: profile.certifications || '', // Note: ce champ n'existe pas dans la DB
              langues_parlees: profile.langues || '', // langues (DB) -> langues_parlees (frontend)
              
              // Paramètres de visibilité
              profil_public: profile.profil_public || false,
              visible_recherche: profile.visible_recherche !== false,
              afficher_avis: profile.afficher_avis !== false
            });
            
            // Charger les paramètres de visibilité
            if (profile.visibility_settings) {
              setFieldsVisibility(profile.visibility_settings);
            }
          }
          
          // Charger les patients
          try {
            const patientsResponse = await traitantService.getMedecinPatients(user.id);
            if (patientsResponse.success) {
              setPatients(patientsResponse.data);
              setFilteredPatients(patientsResponse.data);
            }
          } catch (error) {
            console.log('⚠️ Service patients non disponible:', error.message);
          }
          
          // Charger les statistiques
          try {
            const statsResponse = await traitantService.getMedecinStats(user.id);
            if (statsResponse.success) {
              setStatistics(statsResponse.data);
            }
          } catch (error) {
            console.log('⚠️ Service statistiques non disponible:', error.message);
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement du profil médecin:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMedecinProfile();
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVisibilityChange = (field, level) => {
    setFieldsVisibility(prev => ({
      ...prev,
      [field]: level
    }));
  };

  const handleGlobalChange = (setting, value) => {
    setGlobalSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      console.log('💾 Sauvegarde du profil médecin...');
      
      // Mapper les champs du frontend vers la base de données
      const updateData = {
        // Informations personnelles
        nom: profileData.nom,
        prenom: profileData.prenom,
        email: profileData.email,
        telephone: profileData.telephone,
        photo_profil: profileData.photo_profil,
        date_naissance: profileData.date_naissance,
        
        // Informations professionnelles - Mapping correct vers les champs DB
        numero_ordre: profileData.numero_ordre,
        specialite: profileData.specialite,
        sous_specialites: profileData.sous_specialites,
        etablissements: profileData.etablissement, // etablissement (frontend) -> etablissements (DB)
        adresse_cabinet: profileData.adresse_cabinet,
        telephone_cabinet: profileData.telephone_cabinet,
        
        // Disponibilités et horaires
        horaires_travail: profileData.horaires_consultation, // horaires_consultation -> horaires_travail
        jours_disponibles: profileData.jours_disponibles,
        duree_consultation: profileData.duree_consultation,
        
        // Bio et formations - Mapping vers les champs DB
        description: profileData.bio, // bio -> description
        diplome: profileData.formations, // formations -> diplome
        parcours_professionnel: profileData.experience, // experience -> parcours_professionnel
        langues: profileData.langues_parlees, // langues_parlees -> langues
        // Note: certifications n'existe pas dans la DB, on pourrait l'ajouter au parcours_professionnel
        
        // Préférences
        accepte_nouveaux_patients: profileData.accepte_nouveaux_patients,
        accepte_non_traitants: profileData.consultations_urgence, // consultations_urgence -> accepte_non_traitants
        teleconsultation: profileData.teleconsultation,
        
        // Paramètres de visibilité
        profil_public: profileData.profil_public,
        visible_recherche: profileData.visible_recherche,
        afficher_avis: profileData.afficher_avis,
        visibility_settings: fieldsVisibility
      };
      
      console.log('📤 Données à sauvegarder:', updateData);
      
      const response = await profileService.updateMyProfile(updateData);
      
      if (response.success) {
        console.log('✅ Profil sauvegardé avec succès');
        
        // Mettre à jour le contexte utilisateur
        if (updateUser) {
          updateUser({
            ...user,
            nom: profileData.nom,
            prenom: profileData.prenom,
            email: profileData.email,
            photo_profil: profileData.photo_profil
          });
        }
        
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        console.error('❌ Erreur lors de la sauvegarde:', response.message);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      throw error; // Propager l'erreur pour handleSaveAndExit
    }
  };

  const formatPatientName = (patient) => {
    return `${patient.prenom} ${patient.nom}`;
  };

  // Fonction pour filtrer et trier les patients
  const filterAndSortPatients = (searchTerm, sortBy) => {
    let filtered = patients;
    
    // Filtrage par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = patients.filter(patient => 
        patient.nom.toLowerCase().includes(term) ||
        patient.prenom.toLowerCase().includes(term) ||
        (patient.email && patient.email.toLowerCase().includes(term)) ||
        (patient.allergies && patient.allergies.toLowerCase().includes(term)) ||
        (patient.antecedents_medicaux && patient.antecedents_medicaux.toLowerCase().includes(term))
      );
    }
    
    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nom':
          return a.nom.localeCompare(b.nom);
        case 'age':
          return (b.age || 0) - (a.age || 0);
        case 'derniere_consultation':
          return new Date(b.derniere_consultation || 0) - new Date(a.derniere_consultation || 0);
        case 'relation_depuis':
          return new Date(b.relation_depuis || 0) - new Date(a.relation_depuis || 0);
        default:
          return 0;
      }
    });
    
    setFilteredPatients(filtered);
  };

  // Gérer la recherche
  const handlePatientSearch = (term) => {
    setPatientSearchTerm(term);
    filterAndSortPatients(term, patientSortBy);
  };

  // Gérer le tri
  const handlePatientSort = (sortBy) => {
    setPatientSortBy(sortBy);
    filterAndSortPatients(patientSearchTerm, sortBy);
  };

  // Fonction pour basculer le mode édition d'une section
  const toggleEditMode = (section) => {
    setEditModes(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fonction pour sauvegarder et quitter le mode édition
  const handleSaveAndExit = async (section) => {
    try {
      await handleSaveProfile();
      setEditModes(prev => ({
        ...prev,
        [section]: false
      }));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Fonction pour gérer le changement de photo de profil
  const handlePhotoChange = async (photoFile) => {
    try {
      console.log('📷 Changement de photo de profil médecin...', photoFile);
      
      const response = await profileService.uploadProfilePhoto(photoFile);
      console.log('✅ Photo uploadée:', response);
      
      if (response.success || response.url) {
        // Mettre à jour les données du profil avec la nouvelle photo
        const newPhotoUrl = response.url || response.data?.url || response.photo_profil;
        
        setProfileData(prev => ({
          ...prev,
          photo_profil: newPhotoUrl
        }));

        // Mettre à jour le contexte utilisateur
        if (updateUser) {
          updateUser({
            ...user,
            photo_profil: newPhotoUrl
          });
        }

        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error('Erreur lors du changement de photo:', error);
      throw error; // Propager l'erreur pour que le composant puisse l'afficher
    }
  };

  if (loading) {
    return (
      <div className="medecin-profile-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de votre profil médecin...</p>
      </div>
    );
  }

  return (
    <div className="medecin-profile-prive">
      {/* Header avec composant UserProfile unifié */}
      <UserProfile
        user={{
          ...profileData,
          role: 'Médecin',
          photo_profil: profileData.photo_profil
        }}
        onPhotoChange={handlePhotoChange}
      />

      {/* Statistiques du médecin */}
      <div className="doctor-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{statistics.total_patients}</span>
            <span className="stat-label">Patients</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{statistics.rdv_ce_mois}</span>
            <span className="stat-label">RDV ce mois</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{statistics.note_moyenne.toFixed(1)}</span>
            <span className="stat-label">Note moyenne</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Spécialité</span>
            <span className="stat-value">{profileData.specialite || 'Médecin généraliste'}</span>
          </div>
        </div>
      </div>

      {/* Message de succès */}
      {showSuccessMessage && (
        <div className="success-message">
          ✅ Profil mis à jour avec succès !
        </div>
      )}

      {/* Navigation des onglets */}
      <div className="tabs-navigation">
        <button
          className={`tab-button ${activeTab === 'informations' ? 'active' : ''}`}
          onClick={() => setActiveTab('informations')}
        >
          📋 Profil Complet
        </button>
        <button
          className={`tab-button ${activeTab === 'disponibilites' ? 'active' : ''}`}
          onClick={() => setActiveTab('disponibilites')}
        >
          📅 Disponibilités
        </button>
        <button
          className={`tab-button ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          👥 Mes Patients
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        
        {/* Onglet Profil Complet */}
        {activeTab === 'informations' && (
          <div className="tab-panel active">
            {/* Section Informations Personnelles et Professionnelles */}
            <div className="section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">👤</span>
                  Informations Personnelles et Professionnelles
                </h2>
                <button
                  className={`btn-edit ${editModes.informations ? 'editing' : ''}`}
                  onClick={() => editModes.informations ? handleSaveAndExit('informations') : toggleEditMode('informations')}
                >
                  {editModes.informations ? '💾 Sauvegarder' : '✏️ Modifier'}
                </button>
              </div>
              
              <MedecinPersonalSection 
                profileData={profileData}
                handleInputChange={handleInputChange}
                editMode={editModes.informations}
              />
            </div>

            {/* Section Présentation */}
            <div className="section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">📝</span>
                  Présentation
                </h2>
                <button
                  className={`btn-edit ${editModes.presentation ? 'editing' : ''}`}
                  onClick={() => editModes.presentation ? handleSaveAndExit('presentation') : toggleEditMode('presentation')}
                >
                  {editModes.presentation ? '💾 Sauvegarder' : '✏️ Modifier'}
                </button>
              </div>
              
              <div className="form-group">
                <label htmlFor="bio">Biographie professionnelle</label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows="4"
                  placeholder="Présentez votre parcours, votre approche médicale..."
                  disabled={!editModes.presentation}
                />
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="formations">Formations</label>
                  <textarea
                    id="formations"
                    value={profileData.formations}
                    onChange={(e) => handleInputChange('formations', e.target.value)}
                    rows="3"
                    placeholder="Diplômes, formations spécialisées..."
                    disabled={!editModes.presentation}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="langues">Langues parlées</label>
                  <input
                    type="text"
                    id="langues"
                    value={profileData.langues_parlees}
                    onChange={(e) => handleInputChange('langues_parlees', e.target.value)}
                    placeholder="Français, Anglais, Arabe..."
                    disabled={!editModes.presentation}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="experience">Expérience professionnelle</label>
                  <textarea
                    id="experience"
                    value={profileData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    rows="5"
                    placeholder="Votre parcours professionnel, postes occupés..."
                    disabled={!editModes.presentation}
                  />
                </div>
              </div>
            </div>

            {/* Section Préférences de Consultation */}
            <div className="section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">⚙️</span>
                  Préférences de Consultation
                </h2>
                <button
                  className={`btn-edit ${editModes.disponibilites ? 'editing' : ''}`}
                  onClick={() => editModes.disponibilites ? handleSaveAndExit('disponibilites') : toggleEditMode('disponibilites')}
                >
                  {editModes.disponibilites ? '💾 Sauvegarder' : '✏️ Modifier'}
                </button>
              </div>
              
              <div className="preferences-grid">
                <label className="checkbox-preference">
                  <input
                    type="checkbox"
                    checked={profileData.accepte_nouveaux_patients}
                    onChange={(e) => handleInputChange('accepte_nouveaux_patients', e.target.checked)}
                    disabled={!editModes.disponibilites}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="preference-text">
                    <strong>Accepter de nouveaux patients</strong>
                    <small>Apparaître dans les recherches de nouveaux patients</small>
                  </span>
                </label>
                
                <label className="checkbox-preference">
                  <input
                    type="checkbox"
                    checked={profileData.consultations_urgence}
                    onChange={(e) => handleInputChange('consultations_urgence', e.target.checked)}
                    disabled={!editModes.disponibilites}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="preference-text">
                    <strong>Consultations d'urgence</strong>
                    <small>Disponible pour les consultations urgentes</small>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Disponibilités */}
        {activeTab === 'disponibilites' && (
          <div className="tab-panel active">
            <div className="section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">📅</span>
                  Gestion des Disponibilités
                </h2>
                <button
                  className={`btn-edit ${editModes.disponibilites ? 'editing' : ''}`}
                  onClick={() => editModes.disponibilites ? handleSaveAndExit('disponibilites') : toggleEditMode('disponibilites')}
                >
                  {editModes.disponibilites ? '💾 Sauvegarder' : '✏️ Modifier'}
                </button>
              </div>
              
              <DisponibiliteSection editMode={editModes.disponibilites} />
            </div>
          </div>
        )}

        {/* Onglet Patients */}
        {activeTab === 'patients' && (
          <div className="tab-panel active">
            <div className="section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">👥</span>
                  Mes Patients ({filteredPatients.length}/{patients.length})
                </h2>
                
                {/* Barre de recherche et filtres */}
                <div className="patients-controls">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Rechercher un patient (nom, email, allergies...)"
                      value={patientSearchTerm}
                      onChange={(e) => handlePatientSearch(e.target.value)}
                      className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  
                  <select 
                    value={patientSortBy} 
                    onChange={(e) => handlePatientSort(e.target.value)}
                    className="sort-select"
                  >
                    <option value="nom">Trier par nom</option>
                    <option value="age">Trier par âge</option>
                    <option value="relation_depuis">Patient depuis</option>
                    <option value="derniere_consultation">Dernière consultation</option>
                  </select>
                </div>
              </div>
              
              {filteredPatients.length > 0 ? (
                <div className="patients-grid">
                  {filteredPatients.map(patient => (
                    <div key={patient.id} className="patient-card">
                      <div className="patient-header">
                        <div className="patient-avatar">
                          {patient.photo_profil ? (
                            <img 
                              src={patient.photo_profil.startsWith('/uploads/') 
                                ? `http://localhost:5000${patient.photo_profil}` 
                                : patient.photo_profil
                              } 
                              alt={`${patient.prenom} ${patient.nom}`}
                            />
                          ) : (
                            <span className="patient-initials">
                              {patient.prenom.charAt(0)}{patient.nom.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="patient-info">
                          <strong>{formatPatientName(patient)}</strong>
                          <div className="patient-details">
                            {patient.age && <span>🎂 {patient.age} ans</span>}
                            {patient.sexe && <span>👤 {patient.sexe}</span>}
                            {patient.groupe_sanguin && <span>🩸 {patient.groupe_sanguin}</span>}
                          </div>
                          {patient.relation_depuis && (
                            <small>
                              📅 Patient depuis le {new Date(patient.relation_depuis).toLocaleDateString('fr-FR')}
                            </small>
                          )}
                          {patient.derniere_consultation && (
                            <small>
                              🏥 Dernière consultation: {new Date(patient.derniere_consultation).toLocaleDateString('fr-FR')}
                            </small>
                          )}
                        </div>
                      </div>
                      
                      {/* Informations médicales importantes */}
                      {(patient.allergies || patient.antecedents_medicaux || patient.traitements_actuels) && (
                        <div className="patient-medical-alerts">
                          {patient.allergies && (
                            <div className="medical-alert allergies">
                              <span className="alert-icon">⚠️</span>
                              <span>Allergies: {patient.allergies}</span>
                            </div>
                          )}
                          {patient.antecedents_medicaux && (
                            <div className="medical-alert antecedents">
                              <span className="alert-icon">📋</span>
                              <span>Antécédents: {patient.antecedents_medicaux}</span>
                            </div>
                          )}
                          {patient.traitements_actuels && (
                            <div className="medical-alert traitements">
                              <span className="alert-icon">💊</span>
                              <span>Traitements: {patient.traitements_actuels}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Contact d'urgence */}
                      {(patient.contact_urgence || patient.personne_urgence) && (
                        <div className="patient-emergency-contact">
                          <span className="emergency-label">🚨 Urgence:</span>
                          {patient.personne_urgence && <span>{patient.personne_urgence}</span>}
                          {patient.contact_urgence && <span>{patient.contact_urgence}</span>}
                        </div>
                      )}
                      
                      <div className="patient-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => console.log('Ouvrir dossier patient:', patient.id)}
                        >
                          📋 Dossier Médical
                        </button>
                        <button 
                          className="btn-primary"
                          onClick={() => console.log('Planifier RDV avec:', patient.id)}
                        >
                          📅 Nouveau RDV
                        </button>
                        <button 
                          className="btn-info"
                          onClick={() => console.log('Contacter patient:', patient.id)}
                        >
                          📞 Contacter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">👥</span>
                  <h3>Aucun patient</h3>
                  <p>Vos patients apparaîtront ici une fois qu'ils vous auront choisi comme médecin traitant.</p>
                </div>
              )}
            </div>
          </div>
        )}
      
      </div>
    </div>
  );
};

export default MedecinProfilePrive;
