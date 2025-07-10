import React, { useEffect, useState } from 'react';
import DashboardPatient from './DashboardPatient';
import DashboardMedecin from './DashboardMedecin';
import './Dashboard.css';
import { getTokenPayload } from '../../utils/tokenUtils';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import UserMenu from '../../components/UserMenu';

const DashboardPage = () => {
  const [role, setRole] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const payload = getTokenPayload(token);
    if (payload?.role) {
      setRole(payload.role);
      setUser(payload); // contient aussi prenom et nom maintenant
    }
  }, []);

  return (
    <>
      <Navbar role={role} />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2 className="welcome-message">
            {user?.prenom ? `Hello ${user.prenom} 👋` : 'Hello 👋'}
          </h2>
          <UserMenu user={user} />
        </div>

        {role === 'patient' && <DashboardPatient />}
        {role === 'medecin' && <DashboardMedecin />}
        {!role && <p>Chargement des données utilisateur...</p>}
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;
