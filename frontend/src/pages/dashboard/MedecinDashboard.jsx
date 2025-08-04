// src/pages/dashboard/MedecinDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MedecinQuickActions from '../../components/role-specific/medecin/MedecinQuickActions';
import DashboardCard from './DashboardCard';
import Loader from '../../components/ui/Loader';
import './MedecinDashboard.css';
import {
  FaUsers,
  FaCalendarCheck,
  FaStethoscope,
  FaStar,
  FaExclamationTriangle,
  FaUserPlus
} from 'react-icons/fa';

const MedecinDashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    weeklyConsultations: 0,
    averageRating: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'medecin') {
      navigate('/auth/login');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simuler le chargement des données
      setTimeout(() => {
        setStats({
          totalPatients: 142,
          todayAppointments: 8,
          weeklyConsultations: 45,
          averageRating: 4.7,
          pendingRequests: 3
        });
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      setError('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Chargement de votre tableau de bord..." />;
  }

  return (
    <div className="medecin-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Bonjour Dr {user?.nom || 'Docteur'} ! 👨‍⚕️</h1>
          <p className="welcome-subtitle">
            Voici un aperçu de votre activité aujourd'hui
          </p>
        </div>
        <div className="date-section">
          <span className="current-date">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      <div className="quick-stats">
        <DashboardCard
          title="Patients actifs"
          value={stats.totalPatients}
          icon={<FaUsers />}
          color="blue"
          onClick={() => navigate('/patients')}
        />
        <DashboardCard
          title="RDV aujourd'hui"
          value={stats.todayAppointments}
          icon={<FaCalendarCheck />}
          color="green"
          onClick={() => navigate('/appointments')}
          highlight={stats.todayAppointments > 0}
        />
        <DashboardCard
          title="Consultations semaine"
          value={stats.weeklyConsultations}
          icon={<FaStethoscope />}
          color="purple"
          onClick={() => navigate('/appointments')}
        />
        <DashboardCard
          title="Demandes reçues"
          value={stats.pendingRequests}
          icon={<FaUserPlus />}
          color="teal"
          onClick={() => navigate('/requests/received')}
          highlight={stats.pendingRequests > 0}
          subtitle="Nouveaux patients"
        />
        <DashboardCard
          title="Note moyenne"
          value={`${stats.averageRating}/5`}
          icon={<FaStar />}
          color="orange"
          onClick={() => navigate('/reviews')}
        />
      </div>

      <div className="quick-actions-section">
        <h3>⚡ Actions rapides</h3>
        <MedecinQuickActions className="dashboard-quick-actions" />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>📊 Activité récente</h3>
          <p>Tableau de bord médecin en cours de développement...</p>
        </div>
      </div>
    </div>
  );
};

export default MedecinDashboard;
