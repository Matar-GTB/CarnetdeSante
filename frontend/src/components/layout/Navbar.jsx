// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import UserMenu from './UserMenu';
import './Navbar.css';
import { getNotificationsApi } from '../../services/notificationService';
import { 
  AiFillHome,
  AiFillMedicineBox,
  AiFillSchedule,
  AiFillMessage 
} from 'react-icons/ai';
import { 
  BsFillCalendarCheckFill, 
  BsFillPersonLinesFill,
  BsFillClockFill,
  BsBellFill
} from 'react-icons/bs';
import { 
  FaSyringe, 
  FaUserMd,
  FaStethoscope
} from 'react-icons/fa';
import { BiMessageDetail } from 'react-icons/bi';

const Navbar = () => {
  // States
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Hooks
  const { user, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // User data
  const userRole = user?.role;
  const userName = `${user?.prenom || ''} ${user?.nom || ''}`.trim();

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

  // Handlers
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  // Navigation links based on role
  const getNavigationLinks = () => {
    const commonLinks = [
      { path: '/dashboard', label: 'Accueil', icon: <AiFillHome className="nav-icon" /> },
    ];

    const roleSpecificLinks = userRole === 'patient' 
      ? [
          { path: '/appointments', label: 'Mes RDV', icon: <BsFillCalendarCheckFill className="nav-icon" /> },
          { path: '/medications', label: 'Médicaments', icon: <AiFillMedicineBox className="nav-icon" /> },
          { path: '/vaccinations', label: 'Vaccinations', icon: <FaSyringe className="nav-icon" /> },
          { path: '/messages', label: 'Messages', icon: <BiMessageDetail className="nav-icon" /> },
        ]
      : [
          // eslint-disable-next-line react/jsx-no-undef
          { path: '/appointments', label: 'Consultations', icon: <RiStethoscopeFill className="nav-icon" /> },
          { path: '/medecin/patients', label: 'Patients', icon: <BsFillPersonLinesFill className="nav-icon" /> },
          { path: '/disponibilites', label: 'Planning', icon: <AiFillSchedule className="nav-icon" /> },
          { path: '/messages', label: 'Messages', icon: <BiMessageDetail className="nav-icon" /> },
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
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo et nom de l'application */}
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-link" onClick={closeMobileMenu}>
            <div className="brand-icon">🩺</div>
            <div className="brand-text">
              <span className="brand-name">Carnet Santé</span>
              <span className="brand-subtitle">Votre santé digitale</span>
            </div>
          </Link>
        </div>


        {/* Navigation principale - Desktop */}
        <div className="navbar-nav desktop-nav">
          {navigationLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActiveLink(link.path) ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Actions navbar */}
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

          {/* Bouton menu mobile */}
          <button 
            className={`mobile-menu-button ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          <div className="mobile-nav-header">
            <div className="mobile-user-info">
              <div className="mobile-avatar">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div className="mobile-user-details">
                <span className="mobile-user-name">{userName}</span>
                <span className="mobile-user-role">
                  {userRole === 'medecin' ? 'Médecin' : 'Patient'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mobile-nav-links">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-nav-link ${isActiveLink(link.path) ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="mobile-nav-icon">{link.icon}</span>
                <span className="mobile-nav-label">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu mobile */}
      {isMenuOpen && (
        <div className="mobile-nav-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  );
};

export default Navbar;
