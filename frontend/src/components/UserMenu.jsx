import { useState } from 'react';
import './UserMenu.css'; // Assure-toi d’avoir ce fichier avec le style fourni

export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false); // Pour afficher/masquer le menu déroulant

  // Initiales de l'utilisateur (ex : Brice Ouedraogo → BO)
  const initials = `${user?.firstname?.[0] || ''}${user?.name?.[0] || ''}`;

  return (
    <div className="user-menu-wrapper">
      {/* Bouton principal avec avatar, nom, et flèche */}
      <button className="user-button" onClick={() => setOpen(!open)}>
        <span className="user-avatar">{initials}</span>
        <span className="user-name">{user?.firstname} {user?.name}</span>
        <span className="chevron">{open ? '▲' : '▼'}</span>
      </button>

      {/* Menu déroulant s’affiche si open === true */}
      {open && (
        <div className="user-dropdown">
          <div className="dropdown-section">
            <strong>Espace Candidat</strong>
            <button>Mon dossier</button>
            <button>Mes candidatures</button>
          </div>
          <hr />
          <div className="dropdown-section">
            <strong>Espace Locataire</strong>
            <button>Ma location</button>
            <button>Mes documents</button>
            <button>Fin de bail</button>
            <button>Support</button>
            <button onClick={onLogout} className="logout">Déconnexion</button>
          </div>
        </div>
      )}
    </div>
  );
}
