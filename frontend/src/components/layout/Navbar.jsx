// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useLocation} from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import UserMenu from './UserMenu';
import './Navbar.css';
import { getNotificationsApi } from '../../services/notificationService';
import { 
  AiFillHome,
  AiFillMedicineBox,
  AiFillSchedule,
} from 'react-icons/ai';
import { 
  BsFillCalendarCheckFill, 
  BsFillPersonLinesFill,
  BsBellFill
} from 'react-icons/bs';
import { 
  FaSyringe,
  FaStethoscope 
} from 'react-icons/fa';
import { BiMessageDetail } from 'react-icons/bi';

const Navbar = ({ navbarId = 'main-navbar' }) => {
  // States
  const [unreadCount, setUnreadCount] = useState(0);


  // Hooks
  const { user, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  // User data
  const userRole = user?.role;

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const data = await getNotificationsApi();
      const unread = data?.filter(n => !n.est_lu)?.length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user]);

  // Effects
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);


  const closeMobileMenu = () => {
    // Fonction gardée pour compatibilité
  };

  // Navigation links based on role
  const getNavigationLinks = () => {
    const commonLinks = [
      { path: '/dashboard', label: 'Accueil', icon: <AiFillHome /> },
    ];

    const roleSpecificLinks = userRole === 'patient' 
      ? [
          { path: '/appointments', label: 'Mes RDV', icon: <BsFillCalendarCheckFill /> },
          { path: '/medications', label: 'Médicaments', icon: <AiFillMedicineBox /> },
          { path: '/vaccinations', label: 'Vaccinations', icon: <FaSyringe /> },
          { path: '/messages', label: 'Messages', icon: <BiMessageDetail /> },
        ]
      : [
          // Pour les médecins - utiliser /consultations
          { path: '/consultations', label: 'Consultations', icon: <FaStethoscope /> },
          { path: '/my-patients', label: 'Patients', icon: <BsFillPersonLinesFill /> },
          { path: '/medecin/planning', label: 'Planning', icon: <AiFillSchedule /> },
          { path: '/messages', label: 'Messages', icon: <BiMessageDetail /> },
        ];

    return [...commonLinks, ...roleSpecificLinks];
  };

  const navigationLinks = getNavigationLinks();

  // Check if link is active
  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <nav className="navbar" id={navbarId} data-navbar-id={navbarId}>
      <div className="navbar-container">
        {/* Logo et nom de l'application - complètement à gauche */}
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-link" onClick={closeMobileMenu}>
            <div className="brand-icon">🩺</div>
            <div className="brand-text">
              <span className="brand-name">Carnet Santé</span>
              <span className="brand-subtitle">Votre santé digitale</span>
            </div>
          </Link>
        </div>

        {/* Barre de navigation horizontale simplifiée */}
        <div className="navbar-center">
          {navigationLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActiveLink(link.path) ? 'active' : ''}`}
              onClick={closeMobileMenu}
              title={link.label}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Actions navbar - complètement à droite */}
        <div className="navbar-actions">
          {/* Notifications */}
          <div className="notification-wrapper">
            <Link to="/notifications" className="notification-link">
              <div className="notification-icon-wrapper">
                <BsBellFill className="notification-icon" />
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
          {/* Menu utilisateur */}
          <div className="user-menu-wrapper">
            <UserMenu />
          </div>

          {/* Bouton menu mobile supprimé */}
        </div>
      </div>

      {/* Menu mobile supprimé car la navbar est toujours horizontale */}

      {/* Pas besoin d'overlay car pas de menu mobile */}
    </nav>
  );
};

export default Navbar;
