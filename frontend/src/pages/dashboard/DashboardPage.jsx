import React from 'react';
import DashboardPatient from './DashboardPatient';
import DashboardMedecin from './DashboardMedecin';
import './Dashboard.css';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import UserMenu from '../../components/UserMenu';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const DashboardPage = () => {
  const { user, role } = useContext(AuthContext);


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
