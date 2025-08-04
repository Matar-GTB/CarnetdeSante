import React from 'react';
import './EmergencySection.css';

const EmergencySection = ({ 
  profileData, 
  handleInputChange, 
  editMode = false 
}) => {
  return (
    <div className="emergency-section">
      <h3>Contacts d'Urgence</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="contact_urgence">Téléphone d'urgence</label>
          <input
            type="tel"
            id="contact_urgence"
            value={profileData.contact_urgence || ''}
            onChange={(e) => handleInputChange('contact_urgence', e.target.value)}
            disabled={!editMode}
            placeholder="Ex: 01 23 45 67 89"
          />
        </div>

        <div className="form-group">
          <label htmlFor="personne_urgence">Personne à contacter</label>
          <input
            type="text"
            id="personne_urgence"
            value={profileData.personne_urgence || ''}
            onChange={(e) => handleInputChange('personne_urgence', e.target.value)}
            disabled={!editMode}
            placeholder="Nom de la personne à contacter"
          />
        </div>
      </div>
      
      <div className="emergency-warning">
        <div className="warning-icon">⚠️</div>
        <div className="warning-text">
          <p><strong>Important :</strong> Ces informations peuvent être consultées par les services d'urgence en cas de besoin médical.</p>
        </div>
      </div>
    </div>
  );
};

export default EmergencySection;
