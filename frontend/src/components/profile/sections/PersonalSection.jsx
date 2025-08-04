import React from 'react';
import './PersonalSection.css';

const PersonalSection = ({ 
  profileData, 
  handleInputChange, 
  editMode = false 
}) => {
  // Debug log pour voir les données reçues
  console.log('🔍 PersonalSection - Données reçues:', profileData);
  console.log('✏️ PersonalSection - Mode édition:', editMode);

  return (
    <div className="personal-section">
      <h3>Informations Personnelles</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="nom">Nom *</label>
          <input
            type="text"
            id="nom"
            value={profileData.nom || ''}
            onChange={(e) => handleInputChange('nom', e.target.value)}
            disabled={!editMode}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prenom">Prénom *</label>
          <input
            type="text"
            id="prenom"
            value={profileData.prenom || ''}
            onChange={(e) => handleInputChange('prenom', e.target.value)}
            disabled={!editMode}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={profileData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!editMode}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="telephone">Téléphone</label>
          <input
            type="tel"
            id="telephone"
            value={profileData.telephone || ''}
            onChange={(e) => handleInputChange('telephone', e.target.value)}
            disabled={!editMode}
            placeholder="Ex: 01 23 45 67 89"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date_naissance">Date de naissance</label>
          <input
            type="date"
            id="date_naissance"
            value={profileData.date_naissance || ''}
            onChange={(e) => handleInputChange('date_naissance', e.target.value)}
            disabled={!editMode}
          />
        </div>

        <div className="form-group">
          <label htmlFor="adresse">Adresse</label>
          <textarea
            id="adresse"
            value={profileData.adresse || ''}
            onChange={(e) => handleInputChange('adresse', e.target.value)}
            disabled={!editMode}
            rows="3"
            placeholder="Adresse complète..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="numero_secu">Numéro de Sécurité Sociale</label>
          <input
            type="text"
            id="numero_secu"
            value={profileData.numero_secu || ''}
            onChange={(e) => handleInputChange('numero_secu', e.target.value)}
            disabled={!editMode}
            placeholder="Ex: 1234567890123"
            maxLength="15"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalSection;
