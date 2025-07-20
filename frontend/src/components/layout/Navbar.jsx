// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { getNotificationsApi } from '../../services/notificationService';
const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => navigate('/Logout');
  const [nonLues, setNonLues] = useState(0);
  const { role,} = useContext(AuthContext);


useEffect(() => {
    const fetchNonLues = async () => {
      try {
        const data = await getNotificationsApi();
        const count = data.filter(n => !n.est_lu).length;
        setNonLues(count);
      } catch (err) {
        console.error('Erreur chargement notifications :', err);
      }
    };

    fetchNonLues();
  }, []);
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">🩺 Carnet Santé</Link>
      </div>
      <ul className="navbar-links">
        {role === 'patient' && (
          <>
            <li><Link to="/dashboard">Accueil</Link></li>
            <li><Link to="/documents">Documents</Link></li>
            <li><Link to="/vaccinations">Vaccins</Link></li>
            <li><Link to="/rendezvous">Rendez-vous</Link></li>
            <li><Link to="/partage">Partage</Link></li>
            <Link to="/medications"> Prise de médicaments</Link>
            {/* Rappels programmés */}
            <li><Link to="/rappels">Rappels</Link></li>
           
          </>
        )}

        {role === 'medecin' && (
          <>
            <li><Link to="/dashboard">Accueil</Link></li>
            <li><Link to="/patients">Mes patients</Link></li>
            <li><Link to="/consultations">Consultations</Link></li>
            <li><Link to="/documents">Documents</Link></li>
            <li><Link to="/traitants/requests">Demandes de médecin</Link></li>
          </>
        )}

        {/* Liens communs aux deux rôles */}
        <li className="notif-link-wrapper">
  <Link to="/notifications" className="notif-link">
    Notifications
    {nonLues > 0 && <span className="notif-badge">{nonLues}</span>}
  </Link>
</li>
        {/* Déconnexion */}
        <li>
          <button onClick={handleLogout} className="Logout-btn">
            Se déconnecter
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
