import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/Logout');
  };

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
          </>
        )}
        {role === 'medecin' && (
          <>
            <li><Link to="/dashboard">Accueil</Link></li>
            <li><Link to="/patients">Mes patients</Link></li>
            <li><Link to="/consultations">Consultations</Link></li>
            <li><Link to="/documents">Documents</Link></li>
          </>
        )}
        <li><button onClick={handleLogout} className="Logout-btn">Se déconnecter</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;
