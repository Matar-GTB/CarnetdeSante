import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import PersonalProfile from '../../components/profile/PersonalProfile';
import PatientProfile from '../../components/profile/PatientProfile';
import MedecinProfile from '../../components/profile/MedecinProfile';
import { getTokenPayload } from '../../utils/tokenUtils';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const payload = getTokenPayload(token);

    if (!token || !payload) {
      navigate('/login'); // redirige si non connecté
    } else {
      setUser({ ...payload, token });
    }
  }, [navigate]);

  if (!user) return <div className="loading">Chargement du profil...</div>;

  return (
    <div className="profile-page">
      <div className="profile-header-section">
        <Link to="/dashboard" className="back-button">← Retour</Link>
        <Link to="/settings/account" className="settings-link">Paramètres du compte</Link>
      </div>

      <div className="profile-sections">
        <PersonalProfile token={user.token} />
        {user.role === 'patient' && <PatientProfile token={user.token} />}
        {user.role === 'medecin' && <MedecinProfile token={user.token} />}
      </div>
    </div>
  );
};

export default ProfilePage;
