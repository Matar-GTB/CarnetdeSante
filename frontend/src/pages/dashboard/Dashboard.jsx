// src/pages/dashboard/Dashboard.jsx - Version Unifiée et Optimisée
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PatientDashboard from './PatientDashboard';
import MedecinDashboard from './MedecinDashboard';
import AdminDashboard from './AdminDashboard';
import Loader from '../../components/ui/Loader';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      navigate('/auth/login');
      return;
    }

    setLoading(false);
  }, [isAuthenticated, user, authLoading, navigate]);

  if (authLoading || loading) {
    return <Loader message="Chargement de votre tableau de bord..." />;
  }

  if (!user) {
    return (
      <div>Utilisateur non trouvé</div>
    );
  }

  // Routage basé sur le rôle
  switch (user.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'medecin':
      return <MedecinDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      navigate('/unauthorized');
      return null;
  }
};

export default Dashboard;
