import React from 'react';
import './PersonalSection.css';

const MedecinPersonalSection = ({ 
  profileData, 
  handleInputChange, 
  editMode = false 
}) => {
  // Debug log pour voir les données reçues
  console.log('🔍 MedecinPersonalSection - Données reçues:', profileData);
  console.log('✏️ MedecinPersonalSection - Mode édition:', editMode);

  return (
    <div className="personal-section">
      <div className="form-grid">
        {/* Informations Personnelles */}
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
          <label htmlFor="email">Email professionnel *</label>
          <input
            type="email"
            id="email"
            value={profileData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!editMode}
            required
            placeholder="email@cabinet.fr"
          />
        </div>

        <div className="form-group">
          <label htmlFor="telephone">Téléphone personnel</label>
          <input
            type="tel"
            id="telephone"
            value={profileData.telephone || ''}
            onChange={(e) => handleInputChange('telephone', e.target.value)}
            disabled={!editMode}
            placeholder="Ex: 06 12 34 56 78"
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

        {/* Informations Professionnelles */}
        
        <div className="form-group">
          <label htmlFor="numero_ordre">Numéro d'ordre</label>
          <input
            type="text"
            id="numero_ordre"
            value={profileData.numero_ordre || ''}
            onChange={(e) => handleInputChange('numero_ordre', e.target.value)}
            disabled={!editMode}
            placeholder="Ex: 12345678901"
          />
        </div>
 
        <div className="form-group">
          <label htmlFor="specialite">Spécialité *</label>
          <select
            id="specialite"
            value={profileData.specialite || ''}
            onChange={(e) => handleInputChange('specialite', e.target.value)}
            required
            disabled={!editMode}
          >
            <option value="">Choisir une spécialité</option>
            <option value="Médecine générale">Médecine générale</option>
            <option value="Cardiologie">Cardiologie</option>
            <option value="Dermatologie">Dermatologie</option>
            <option value="Pédiatrie">Pédiatrie</option>
            <option value="Gynécologie">Gynécologie</option>
            <option value="Pneumologie">Pneumologie</option>
            <option value="Rhumatologie">Rhumatologie</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="sous_specialites">Sous-spécialités</label>
          <input
            type="text"
            id="sous_specialites"
            value={profileData.sous_specialites || ''}
            onChange={(e) => handleInputChange('sous_specialites', e.target.value)}
            disabled={!editMode}
            placeholder="Ex: Cardiologie interventionnelle, Échographie..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="etablissement">Établissement</label>
          <input
            type="text"
            id="etablissement"
            value={profileData.etablissement || ''}
            onChange={(e) => handleInputChange('etablissement', e.target.value)}
            placeholder="Hôpital, clinique, cabinet..."
            disabled={!editMode}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="adresse_cabinet">Adresse</label>
          <textarea
            id="adresse_cabinet"
            value={profileData.adresse_cabinet || ''}
            onChange={(e) => handleInputChange('adresse_cabinet', e.target.value)}
            rows="2"
            placeholder="Adresse complète"
            disabled={!editMode}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="telephone_cabinet">Téléphone professionnel</label>
          <input
            type="tel"
            id="telephone_cabinet"
            value={profileData.telephone_cabinet || ''}
            onChange={(e) => handleInputChange('telephone_cabinet', e.target.value)}
            disabled={!editMode}
          />
        </div>
      </div>
    </div>
  );
};

export default MedecinPersonalSection;
