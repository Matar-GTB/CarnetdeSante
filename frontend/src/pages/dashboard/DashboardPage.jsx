// frontend/src/pages/dashboard/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import DashboardPatient from './DashboardPatient';
import DashboardMedecin from './DashboardMedecin';
import './Dashboard.css';
import { getTokenPayload } from '../../utils/tokenUtils';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const DashboardPage = () => {
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const payload = getTokenPayload(token);
    if (payload?.role) {
      setRole(payload.role);
    }
  }, []);

  return (
    <>
      <Navbar role={role} />
      <div className="dashboard-container">
        <h2>Bienvenue sur votre tableau de bord</h2>
        {role === 'patient' && <DashboardPatient />}
        {role === 'medecin' && <DashboardMedecin />}
        {!role && <p>Chargement des données utilisateur...</p>}
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;
