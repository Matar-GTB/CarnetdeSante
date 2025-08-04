import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
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
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);

  // Données utilisateur
  const userInitials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase();
  const userRole = user?.role;
  const userName = `${user?.prenom || ''} ${user?.nom || ''}`.trim();

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
      { icon: <BsGlobe className="menu-icon" />, label: 'Mon profil public', path: profileRoutes.public, external: true },
      { icon: <BsFillFileTextFill className="menu-icon" />, label: 'Documents', path: '/documents' },
      { icon: <BsFillClockFill className="menu-icon" />, label: 'Rappels', path: '/rappels' },
      { icon: <BsFillBellFill className="menu-icon" />, label: 'Notifications', path: '/notifications' },
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
          <span className="avatar-initials">{userInitials}</span>
        </div>
        <div className="user-details">
          <span className="user-name">{userName}</span>
          <span className="user-role">
            {userRole === 'medecin' ? (
              <><FaUserMd className="role-icon" /> Médecin</>
            ) : (
              <><BsFillPersonFill className="role-icon" /> Patient</>
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
              <span className="avatar-initials-large">{userInitials}</span>
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
              item.external ? (
                <a
                  key={index}
                  href={item.path}
                  className="menu-item"
                  onClick={closeMenu}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </a>
              ) : (
                <Link
                  key={index}
                  to={item.path}
                  className="menu-item"
                  onClick={closeMenu}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </Link>
              )
            ))}
          </div>

          <div className="menu-divider"></div>

          {/* Paramètres */}
          <div className="menu-section">
            {menuItems.settings.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="menu-item"
                onClick={closeMenu}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="menu-divider"></div>

          {/* Déconnexion */}
          <button 
            className="menu-item logout-item" 
            onClick={handleLogout}
          >
            <FaSignOutAlt className="menu-icon" />
            <span className="menu-label">Déconnexion</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
