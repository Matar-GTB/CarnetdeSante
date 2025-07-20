import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserMenu.css';
import { AuthContext } from '../contexts/AuthContext';
import { getTokenPayload } from '../utils/tokenUtils';

const UserMenu = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase();
  const role = getTokenPayload()?.role;

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button className="user-menu-button" onClick={() => setOpen(!open)}>
        <span className="user-icon">👤</span>
        <div className="avatar-circle">{initials}</div>
        <span className="user-name">{user?.prenom} {user?.nom}</span>
        <span className="dropdown-icon">▾</span>
      </button>

      {open && (
        <ul className="user-menu-dropdown">
          <li><Link to="/profile">👤 Mon profil</Link></li>

          {role === 'medecin' && (
            <li><Link to="/disponibilites">🗓️ Disponibilités</Link></li>
          )}

          <li className="parametres-toggle" onClick={() => setShowSettings(prev => !prev)}>
            ⚙️ Paramètres ▸
            {showSettings && (
              <ul className="parametres-submenu">
                <li><Link to="/settings/account">🔐 Compte</Link></li>
                <li><Link to="/settings/notifications">🔔 Notifications</Link></li>
              </ul>
            )}
          </li>

          <li onClick={handleLogout}>🚪 Déconnexion</li>
        </ul>
      )}
    </div>
  );
};

export default UserMenu;
