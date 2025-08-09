// pages/Profile/PatientProfilePrive.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClipboardList, FaHospital, FaExclamationTriangle } from 'react-icons/fa';
import { AuthContext } from '../../contexts/AuthContext';
import profileService from '../../services/profileService';
import UserProfile from '../../components/profile/UserProfile';
import PersonalSection from '../../components/profile/sections/PersonalSection';
import MedicalSection from '../../components/profile/sections/MedicalSection';
import EmergencySection from '../../components/profile/sections/EmergencySection';
import './PatientProfilePrive.css';

const PatientProfilePrive = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    // Informations personnelles
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    date_naissance: '',
    adresse: '',
    numero_secu: '',
    photo_profil: '', // Ajout de la photo
    
    // Informations médicales
    groupe_sanguin: '',
    allergies: '',
    antecedents_medicaux: '',
    traitements_actuels: '',
    
    // Contacts d'urgence
    contact_urgence: '',
    personne_urgence: '',
    
    // Médecin traitant
    medecin_traitant_id: null,
    
    // Préférences
    langue_preferee: 'fr',
    notifications_email: true,
    notifications_sms: false
  });
  
  const [fieldsVisibility, setFieldsVisibility] = useState({
    nom: 'private',
    prenom: 'private',
    telephone: 'private',
    email: 'private',
    allergies: 'emergency',
    groupe_sanguin: 'emergency',
    antecedents_medicaux: 'traitant',
    contact_urgence: 'emergency',
    personne_urgence: 'emergency'
  });
  
  const [globalSettings, setGlobalSettings] = useState({
    donnees_visibles_medecins: true,
    autoriser_recherche_medecins: false,
    partage_urgences: true
  });
  
  const [medecinTraitant, setMedecinTraitant] = useState(null);
  const [medecinsTraitants, setMedecinsTraitants] = useState([]);
  const [rendezVous, setRendezVous] = useState([]);
  const [medications, setMedications] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('informations');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [emergencyLink, setEmergencyLink] = useState('');
  // État pour contrôler le mode édition de chaque section
  const [editModes, setEditModes] = useState({
    informations: false,
    medicales: false,
    urgence: false,
    preferences: false,
    visibilite: false
  });

  useEffect(() => {
    const loadPatientProfile = async () => {
      try {
        setLoading(true);
        
        if (user && user.id) {
          console.log('👤 Données utilisateur connecté:', user);

          // Charger le profil complet depuis l'API
          const profileResponse = await profileService.getMyProfile();
          console.log('📋 Réponse profil service:', profileResponse);

          if (profileResponse.success && profileResponse.data.profile) {
            console.log('✅ Données profil chargées:', profileResponse.data.profile);
            
            // Mettre à jour avec toutes les données du profil
            setProfileData(prev => ({
              ...prev,
              // Données de base
              nom: profileResponse.data.profile.nom || '',
              prenom: profileResponse.data.profile.prenom || '',
              email: profileResponse.data.profile.email || '',
              telephone: profileResponse.data.profile.telephone || '',
              date_naissance: profileResponse.data.profile.date_naissance || '',
              adresse: profileResponse.data.profile.adresse || '',
              photo_profil: profileResponse.data.profile.photo_profil || '', // Ajout de la photo
              
              // Données médicales critiques
              numero_secu: profileResponse.data.profile.numero_secu || '',
              groupe_sanguin: profileResponse.data.profile.groupe_sanguin || '',
              allergies: profileResponse.data.profile.allergies || '',
              antecedents_medicaux: profileResponse.data.profile.antecedents_medicaux || '',
              traitements_actuels: profileResponse.data.profile.traitements_actuels || '',
              
              // Contacts d'urgence
              contact_urgence: profileResponse.data.profile.contact_urgence || '',
              personne_urgence: profileResponse.data.profile.personne_urgence || '',
              
              // Autres champs
              medecin_traitant_id: profileResponse.data.profile.medecin_traitant_id || null,
              langue_preferee: profileResponse.data.profile.langue_preferee || 'fr',
              // Correction des notifications pour utiliser preferences_notifications
              notifications_email: profileResponse.data.profile.preferences_notifications?.email !== false,
              notifications_sms: profileResponse.data.profile.preferences_notifications?.sms === true
            }));
            
            setFieldsVisibility(prev => ({
              ...prev,
              ...profileResponse.data.visibility
            }));
            setGlobalSettings(prev => ({
              ...prev,
              ...profileResponse.data.settings
            }));
            setEmergencyLink(profileResponse.data.emergencyLink || '');
          } else {
            // Si pas de données du service, utiliser les données du contexte comme fallback
            console.log('🔄 Utilisation des données du contexte utilisateur comme fallback');
            setProfileData(prev => ({
              ...prev,
              nom: user.nom || '',
              prenom: user.prenom || '',
              email: user.email || '',
              telephone: user.telephone || '',
              date_naissance: user.date_naissance || '',
              adresse: user.adresse || '',
              numero_secu: user.numero_secu || ''
            }));
          }
          
          // Charger les médecins traitants
          const traitantsResponse = await profileService.getMesTraitants();
          if (traitantsResponse.success) {
            console.log('👨‍⚕️ Médecins traitants chargés:', traitantsResponse.data);
            setMedecinsTraitants(traitantsResponse.data);
          }
          
          // Charger le médecin traitant
          if (profileData.medecin_traitant_id) {
            const medecinResponse = await profileService.getMedecinTraitant(profileData.medecin_traitant_id);
            if (medecinResponse.success) {
              setMedecinTraitant(medecinResponse.data);
            }
          }
          
          // Charger les rendez-vous
          const rdvResponse = await profileService.getPatientRendezVous(user.id);
          if (rdvResponse.success) {
            setRendezVous(rdvResponse.data);
          }
          
          // Charger les médications
          const medicationsResponse = await profileService.getPatientMedications(user.id);
          if (medicationsResponse.success) {
            setMedications(medicationsResponse.data);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil patient:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatientProfile();
  }, [user, profileData.medecin_traitant_id]);

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
      setSaving(true);
      console.log('💾 Début de la sauvegarde du profil');
      console.log('📊 Données à sauvegarder:', profileData);
      
      // Préparer les données avec le bon format pour les notifications
      const dataToSave = {
        ...profileData,
        // Convertir les notifications au format preferences_notifications
        preferences_notifications: {
          email: profileData.notifications_email,
          sms: profileData.notifications_sms,
          push: true // Valeur par défaut
        }
      };
      
      // Supprimer les champs redondants
      delete dataToSave.notifications_email;
      delete dataToSave.notifications_sms;
      
      console.log('🔄 Envoi des données au service...', dataToSave);
      const response = await profileService.updateMyProfile(dataToSave);
      console.log('✅ Réponse du service pour le profil:', response);
      
      const visibilityResponse = await profileService.updateVisibilitySettings(fieldsVisibility);
      console.log('✅ Réponse du service pour la visibilité:', visibilityResponse);

      
      if (response.success) {
        console.log('🎉 Sauvegarde réussie');
        // Mettre à jour le contexte utilisateur
        if (updateUser) {
          updateUser({
            ...user,
            nom: profileData.nom,
            prenom: profileData.prenom,
            email: profileData.email,
            numero_secu: profileData.numero_secu,
            groupe_sanguin: profileData.groupe_sanguin
          });
        }
        
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Afficher un message d'erreur à l'utilisateur
      setShowSuccessMessage(false);
      // TODO: Afficher un message d'erreur
    } finally {
      setSaving(false);
    }
  };

  const generateEmergencyLink = async () => {
    try {
      const response = await profileService.generateEmergencyLink(user.id);
      if (response.success) {
        setEmergencyLink(response.data.emergencyLink);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du lien d\'urgence:', error);
    }
  };

  // Fonction pour gérer le changement de photo de profil
  const handlePhotoChange = async (photoFile) => {
    try {
      console.log('📷 Changement de photo de profil...', photoFile);
      
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

  const copyEmergencyLink = () => {
    if (emergencyLink) {
      navigator.clipboard.writeText(emergencyLink);
      // Vous pourriez ajouter une notification ici
    }
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
      setSaving(true);
      
      // Si c'est la section visibilité, sauvegarder uniquement les paramètres de visibilité
      if (section === 'visibilite') {
        const visibilityResponse = await profileService.updateVisibilitySettings(fieldsVisibility);
        console.log('✅ Réponse du service pour la visibilité:', visibilityResponse);
        
        if (visibilityResponse.success) {
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        }
      } else {
        // Pour les autres sections, sauvegarder le profil complet
        await handleSaveProfile();
      }
      
      setEditModes(prev => ({
        ...prev,
        [section]: false
      }));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="patient-profile-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="patient-profile-prive">
      {/* Bouton Retour */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Retour
      </button>

      {/* Header avec composant UserProfile unifié */}
      <UserProfile
        user={{
          ...profileData,
          role: 'Patient',
          photo_profil: profileData.photo_profil
        }}
        onPhotoChange={handlePhotoChange}
      />

      {/* Statistiques rapides */}
      <div className="profile-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{rendezVous.length}</span>
            <span className="stat-label">Rendez-vous</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{medications.length}</span>
            <span className="stat-label">Médicaments</span>
          </div>
          {medecinTraitant && (
            <div className="stat-item">
              <span className="stat-label">Médecin traitant</span>
              <span className="stat-value">Dr. {medecinTraitant.nom}</span>
            </div>
          )}
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
          <FaClipboardList /> Informations & Préférences
        </button>
        <button
          className={`tab-button ${activeTab === 'medical' ? 'active' : ''}`}
          onClick={() => setActiveTab('medical')}
        >
          <FaHospital /> Médical
        </button>
        <button
          className={`tab-button ${activeTab === 'urgence' ? 'active' : ''}`}
          onClick={() => setActiveTab('urgence')}
        >
          <FaExclamationTriangle /> Urgence
        </button>
      </div> {/* <-- This closes the .tabs-navigation div */}

      {/* Contenu des onglets */}
      <div className="tab-content">
        
        {/* Onglet Informations */}
        {activeTab === 'informations' && (
          <>
          {console.log('✅ Affichage onglet informations')}
          <div className="tab-panel active">
            {/* Section Informations Personnelles */}
            <div className="section-with-edit">
              <div className="section-header">
                <h2>
                  <span className="section-icon">👤</span>
                  Informations Personnelles
                </h2>
                <div className="section-actions">
                  {!editModes.informations ? (
                    <button 
                      className="btn-edit"
                      onClick={() => toggleEditMode('informations')}
                      disabled={saving}
                    >
                      ✏️ Modifier
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button 
                        className="btn-save"
                        onClick={() => handleSaveAndExit('informations')}
                        disabled={saving}
                      >
                        {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => toggleEditMode('informations')}
                        disabled={saving}
                      >
                        ❌ Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <PersonalSection 
                profileData={profileData}
                handleInputChange={handleInputChange}
                editMode={editModes.informations}
              />
            </div>

            <div className="section-with-edit">
              <div className="section-header">
                <h2>
                  <span className="section-icon">⚙️</span>
                  Préférences
                </h2>
                <div className="section-actions">
                  {!editModes.preferences ? (
                    <button 
                      className="btn-edit"
                      onClick={() => toggleEditMode('preferences')}
                    >
                      <span>✏️</span> Modifier
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button 
                        className="btn-save"
                        onClick={() => toggleEditMode('preferences')}
                      >
                        <span>💾</span> Sauvegarder
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => toggleEditMode('preferences')}
                      >
                        <span>❌</span> Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="langue">Langue préférée</label>
                  <select
                    id="langue"
                    value={profileData.langue_preferee}
                    onChange={(e) => handleInputChange('langue_preferee', e.target.value)}
                    disabled={!editModes.preferences}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
              
              <div className="preferences-grid">
                <label className="checkbox-preference">
                  <input
                    type="checkbox"
                    checked={profileData.notifications_email}
                    onChange={(e) => handleInputChange('notifications_email', e.target.checked)}
                    disabled={!editModes.preferences}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="preference-text">
                    <strong>Notifications par email</strong>
                    <small>Recevoir les rappels de RDV et informations importantes</small>
                  </span>
                </label>
                
                <label className="checkbox-preference">
                  <input
                    type="checkbox"
                    checked={profileData.notifications_sms}
                    onChange={(e) => handleInputChange('notifications_sms', e.target.checked)}
                    disabled={!editModes.preferences}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="preference-text">
                    <strong>Notifications par SMS</strong>
                    <small>Recevoir les rappels urgents par SMS</small>
                  </span>
                </label>
              </div>
            </div>
          </div>
          </>
        )}

        {/* Onglet Médical */}
        {activeTab === 'medical' && (
          <>
          {console.log('✅ Onglet médical')}
          <div className="tab-panel active">
            {/* Section Informations Médicales */}
            <div className="section-with-edit">
              <div className="section-header">
                <h2>
                  <span className="section-icon">🏥</span>
                  Informations Médicales
                </h2>
                <div className="section-actions">
                  {!editModes.medicales ? (
                    <button 
                      className="btn-edit"
                      onClick={() => toggleEditMode('medicales')}
                      disabled={saving}
                    >
                      ✏️ Modifier
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button 
                        className="btn-save"
                        onClick={() => handleSaveAndExit('medicales')}
                        disabled={saving}
                      >
                        {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => toggleEditMode('medicales')}
                        disabled={saving}
                      >
                        ❌ Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <MedicalSection 
                profileData={profileData}
                handleInputChange={handleInputChange}
                editMode={editModes.medicales}
              />
            </div>

            {/* Section Médecins Traitants */}
            <div className="section">
              <h2>
                <span className="section-icon">👨‍⚕️</span>
                Mes Médecins Traitants
              </h2>
              
              {medecinsTraitants.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">👨‍⚕️</span>
                  <h3>Aucun médecin traitant</h3>
                  <p>Aucun médecin traitant enregistré pour le moment.</p>
                </div>
              ) : (
                <div className="medecins-list">
                  {medecinsTraitants.map((medecin, index) => (
                    <div key={medecin.id || index} className="medecin-card">
                      <div className="medecin-info">
                        <div className="medecin-photo">
                          {medecin.photo_profil ? (
                            <img 
                              src={`/uploads/profiles/${medecin.photo_profil}`} 
                              alt={`${medecin.prenom} ${medecin.nom}`}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="photo-placeholder">👨‍⚕️</div>
                          )}
                        </div>
                        <div className="medecin-details">
                          <h4>Dr. {medecin.prenom} {medecin.nom}</h4>
                          {medecin.specialite && (
                            <p className="specialite">Spécialité: {medecin.specialite}</p>
                          )}
                          {medecin.etablissements && (
                            <p className="etablissement">Établissement: {medecin.etablissements}</p>
                          )}
                          {medecin.langues && (
                            <p className="langues">Langues: {medecin.langues}</p>
                          )}
                        </div>
                      </div>
                      <div className="medecin-actions">
                        <button 
                          className="btn-view-profile"
                          onClick={() => {
                            // TODO: Implémenter la navigation vers le profil du médecin
                            console.log('Voir le profil du médecin:', medecin.id);
                          }}
                        >
                          👁️ Voir profil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </>
        )}

        {/* Onglet Urgence */}
        {activeTab === 'urgence' && (
          <div className="tab-panel active">
            {/* Section Contacts d'Urgence */}
            <div className="section-with-edit">
              <div className="section-header">
                <h2>
                  <span className="section-icon">🚨</span>
                  Contacts d'Urgence
                </h2>
                <div className="section-actions">
                  {!editModes.urgence ? (
                    <button 
                      className="btn-edit"
                      onClick={() => toggleEditMode('urgence')}
                      disabled={saving}
                    >
                      ✏️ Modifier
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button 
                        className="btn-save"
                        onClick={() => handleSaveAndExit('urgence')}
                        disabled={saving}
                      >
                        {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => toggleEditMode('urgence')}
                        disabled={saving}
                      >
                        ❌ Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <EmergencySection 
                profileData={profileData}
                handleInputChange={handleInputChange}
                editMode={editModes.urgence}
              />
            </div>

            <div className="section">
              <h2>
                <span className="section-icon">🔗</span>
                Lien d'Urgence Médicale
              </h2>
              
              <div className="emergency-link-section">
                <p className="emergency-explanation">
                  Ce lien permet aux services d'urgence d'accéder rapidement à vos informations 
                  médicales critiques (groupe sanguin, allergies, contacts d'urgence).
                </p>
                
                {emergencyLink ? (
                  <div className="emergency-link-display">
                    <input
                      type="text"
                      value={emergencyLink}
                      readOnly
                      className="emergency-link-input"
                    />
                    <button
                      onClick={copyEmergencyLink}
                      className="btn-copy"
                    >
                      📋 Copier
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={generateEmergencyLink}
                    className="btn-generate"
                  >
                    🔗 Générer le lien d'urgence
                  </button>
                )}
                
                <div className="emergency-warning">
                  <p>
                    ⚠️ <strong>Important :</strong> Ce lien donne accès à vos informations 
                    médicales d'urgence. Ne le partagez qu'avec les personnes de confiance 
                    (famille, services de secours).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfilePrive;
