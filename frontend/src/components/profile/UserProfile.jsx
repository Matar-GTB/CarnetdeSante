import React, { useState, useRef } from 'react';
import './UserProfile.css';

const UserProfile = ({ user, onPhotoChange }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Fonction pour obtenir l'icône appropriée selon le rôle
  const getRoleIcon = (role) => {
    switch(role?.toLowerCase()) {
      case 'medecin':
      case 'médecin':
        return '👨‍⚕️';
      case 'patient':
        return '👤';
      default:
        return '👤';
    }
  };

  // Fonction pour obtenir le badge de rôle formaté
  const getRoleBadge = (role) => {
    switch(role?.toLowerCase()) {
      case 'medecin':
      case 'médecin':
        return 'Médecin';
      case 'patient':
        return 'Patient';
      default:
        return role || 'Utilisateur';
    }
  };

  // Gérer la sélection de photo
  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide.');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille de l\'image ne doit pas dépasser 5MB.');
        return;
      }

      setSelectedPhoto(file);
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Ouvrir le sélecteur de fichier
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Annuler les modifications de photo
  const cancelPhotoChange = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Sauvegarder la photo
  const savePhoto = async () => {
    if (selectedPhoto && onPhotoChange) {
      try {
        await onPhotoChange(selectedPhoto);
        setSelectedPhoto(null);
        setPhotoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la photo:', error);
        alert('Erreur lors de la sauvegarde de la photo.');
      }
    }
  };

  // Déterminer quelle image afficher
  const getDisplayImage = () => {
    if (photoPreview) return photoPreview;
    if (user?.photo_profil) {
      // Si l'URL est relative, ajouter le préfixe du serveur
      if (user.photo_profil.startsWith('/uploads/')) {
        const fullUrl = `http://localhost:5000${user.photo_profil}`;
        return fullUrl;
      }
      return user.photo_profil;
    }
    return null;
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="avatar-section">
          {/* Input caché pour sélection de fichier */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />
          
          <div className="avatar">
            {getDisplayImage() ? (
              <img src={getDisplayImage()} alt={`${user.prenom} ${user.nom}`} />
            ) : (
              <div className="avatar-placeholder">
                <span className="role-icon">{getRoleIcon(user.role)}</span>
              </div>
            )}
            {selectedPhoto && (
              <div className="photo-overlay">
                <span className="new-photo-indicator">Nouvelle photo</span>
              </div>
            )}
          </div>
          
          {/* Boutons de gestion de photo - Toujours disponibles */}
          <div className="photo-actions">
            {!selectedPhoto ? (
              <button className="change-photo-btn" onClick={openFileSelector}>
                📷 Changer la photo
              </button>
            ) : (
              <div className="photo-confirm-actions">
                <button className="save-photo-btn" onClick={savePhoto}>
                  ✅ Confirmer
                </button>
                <button className="cancel-photo-btn" onClick={cancelPhotoChange}>
                  ❌ Annuler
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-info">
          <h1>
            {user.role?.toLowerCase() === 'medecin' || user.role?.toLowerCase() === 'médecin' ? 'Dr. ' : ''}
            {user.prenom} {user.nom}
          </h1>
          <p className="role-badge">{getRoleBadge(user.role)}</p>
          <p className="email">{user.email}</p>
          
          {/* Informations supplémentaires selon le rôle */}
          {(user.role?.toLowerCase() === 'medecin' || user.role?.toLowerCase() === 'médecin') && user.specialite && (
            <p className="specialty">Spécialité: {user.specialite}</p>
          )}
          {(user.role?.toLowerCase() === 'medecin' || user.role?.toLowerCase() === 'médecin') && user.etablissement && (
            <p className="etablissement">{user.etablissement}</p>
          )}
          {user.role?.toLowerCase() === 'patient' && user.date_naissance && (
            <p className="birth-date">
              Né(e) le {new Date(user.date_naissance).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
        
        {/* Section actions supprimée - plus de bouton "Modifier le profil" global */}
      </div>
    </div>
  );
};

export default UserProfile;
