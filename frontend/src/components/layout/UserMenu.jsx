import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import profileService from '../../services/profileService';
import './UserMenu.css';
import { 
  AiFillHome,
  AiFillSetting,
  AiFillNotification 
} from 'react-icons/ai';
import { 
  BsGlobe,  // Au lieu de BsGlobeFill
  BsFillPersonFill,
  BsFillFileTextFill,
  BsFillClockFill,
  BsFillBellFill,
  BsFillShieldLockFill // Ajout de cette icône
} from 'react-icons/bs';
import { 
  FaUserMd, 
  FaUserCircle,
  FaSignOutAlt 
} from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);

  // Chargement du profil complet de l'utilisateur depuis l'API avec rafraîchissement régulier
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (user && user.id) {
          const response = await profileService.getMyProfile();
          if (response.success) {
            setUserProfileData(response.data.profile);
          } else {
            console.error("❌ Erreur de chargement du profil:", response.message || "Erreur inconnue");
          }
        }
      } catch (error) {
        console.error("❌ Exception lors du chargement du profil:", error);
      }
    };

    // Chargement initial
    loadUserProfile();
    
    // Rafraîchissement automatique toutes les 10 secondes pour récupérer les mises à jour
    const refreshInterval = setInterval(loadUserProfile, 10000);
    
    // Nettoyage à la destruction du composant
    return () => clearInterval(refreshInterval);
  }, [user]);

  // Données utilisateur - priorise les données du profil complet (plus récentes) par rapport au contexte
  // Si userProfileData existe, on l'utilise en priorité, sinon on utilise les données de user
  const profile = userProfileData || user || {};
  const userInitials = `${profile?.prenom?.[0] || ''}${profile?.nom?.[0] || ''}`.toUpperCase();
  const userRole = profile?.role;
  const userName = `${profile?.prenom || ''} ${profile?.nom || ''}`.trim();
  
  // Récupération de l'URL de la photo de profil avec priorité au profil complet
  // Cherche la photo dans toutes les propriétés possibles
  const userPhoto = 
    profile?.photo_url || 
    profile?.photo_profil || 
    profile?.profile_photo || 
    profile?.avatar || 
    null;

  // Navigation basée sur le rôle
  const getProfileRoutes = () => {
    if (userRole === 'medecin') {
      return {
        private: '/profile/medecin',
        public: `/doctors/${user?.id}/public`,
        label: 'Profil médecin'
      };
    } else {
      return {
        private: '/profile/private',
        public: `/patients/${user?.id}/public`,
        label: 'Profil patient'
      };
    }
  };

  const profileRoutes = getProfileRoutes();

  // Gestion de la fermeture du menu
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Fermeture du menu lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Configuration des éléments de menu selon le rôle
  const getMenuItems = () => {
    const commonItems = [
      { icon: <AiFillHome className="menu-icon" />, label: 'Accueil', path: '/dashboard' },
      { icon: <BsFillPersonFill className="menu-icon" />, label: 'Mon profil privé', path: profileRoutes.private },
      { icon: <BsGlobe className="menu-icon" />, label: 'Mon profil public', path: profileRoutes.public },
      { icon: <BsFillFileTextFill className="menu-icon" />, label: 'Documents', path: '/documents' },
      { icon: <BsFillClockFill className="menu-icon" />, label: 'Rappels', path: '/rappels' },
      { icon: <BsFillBellFill className="menu-icon" />, label: 'Notifications', path: '/notifications' },
      // Ajout Carnet de santé pour le patient
      ...(userRole === 'patient' ? [
        { icon: <BsFillFileTextFill className="menu-icon" />, label: 'Carnet de santé', path: '/carnet-sante' }
      ] : [])
    ];

    const settingsItems = [
      { icon: <AiFillSetting className="menu-icon" />, label: 'Paramètres', path: '/settings' },
      { icon: <MdSecurity className="menu-icon" />, label: 'Sécurité', path: '/settings/security' },
      { icon: <BsFillShieldLockFill className="menu-icon" />, label: 'Confidentialité', path: '/settings/privacy' },
    ];

    return {
      common: commonItems,
      settings: settingsItems,
    };
  };

  const menuItems = getMenuItems();

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      {/* Bouton principal du menu */}
  <button 
    className={`user-menu-button ${isOpen ? 'active' : ''}`}
    onClick={toggleMenu}
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    <div className="user-avatar">
      {userPhoto ? (
        <img src={userPhoto} alt={userName} />
      ) : (
        <span className="avatar-initials">{userInitials}</span>
      )}
    </div>
    <div className="user-details">
      <span className="user-name">{userName}</span>
      <span className="user-role">
        {userRole === 'medecin' ? (
          <> Médecin</>
        ) : (
          <>Patient</>
        )}
      </span>
    </div>
    <svg 
      className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`} 
      width="16" 
      height="16" 
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path d="M4 6l4 4 4-4H4z"/>
    </svg>
  </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="user-menu-dropdown">
          {/* En-tête du menu */}
          <div className="menu-header">
            <div className="user-avatar-large">
              {userPhoto ? (
                <img src={userPhoto} alt={userName} />
              ) : (
                <span className="avatar-initials-large">{userInitials}</span>
              )}
            </div>
            <div className="user-info-large">
              <h4 className="user-name-large">{userName}</h4>
              <p className="user-role-large">
                {userRole === 'medecin' ? 'Médecin' : 'Patient'}
              </p>
            </div>
          </div>

          <div className="menu-divider"></div>

          {/* Menu items communs */}
          <div className="menu-section">
            {menuItems.common.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="menu-item"
                onClick={closeMenu}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="menu-divider"></div>

          {/* Menu items paramètres */}
          <div className="menu-section">
            {menuItems.settings.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="menu-item"
                onClick={closeMenu}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="menu-divider"></div>

          {/* Déconnexion */}
          <button className="menu-item logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="menu-icon" />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </div>
    );
  }

export default UserMenu;
