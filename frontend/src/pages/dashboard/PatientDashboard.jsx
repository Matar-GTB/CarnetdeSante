// src/pages/dashboard/PatientDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PatientQuickActions from '../../components/role-specific/patient/PatientQuickActions';
import DashboardCard from './DashboardCard';
import Loader from '../../components/ui/Loader';
import './PatientDashboard.css';
import {
  FaFileMedical,
  FaPills,
  FaCalendarAlt,
  FaBell,
  FaExclamationTriangle,
  FaHeart,
  FaUserMd
} from 'react-icons/fa';

const PatientDashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    medicationsCount: 0,
    documentsCount: 0,
    appointmentsCount: 0,
    unreadNotifications: 0,
    traitantsCount: 0
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'patient') {
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
          medicationsCount: 3,
          documentsCount: 8,
          appointmentsCount: 2,
          unreadNotifications: 1,
          traitantsCount: 2
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
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Bonjour {user?.prenom || user?.nom || 'Patient'} ! 👋</h1>
          <p className="welcome-subtitle">
            Voici un aperçu de votre suivi médical aujourd'hui
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
          title="Mes documents"
          value={stats.documentsCount}
          icon={<FaFileMedical />}
          color="blue"
          onClick={() => navigate('/documents')}
        />
        <DashboardCard
          title="Mes médicaments"
          value={stats.medicationsCount}
          icon={<FaPills />}
          color="green"
          onClick={() => {
            console.log('🔄 Redirection vers /medications...');
            navigate('/medications');
          }}
        />
        <DashboardCard
          title="Mes traitants"
          value={stats.traitantsCount}
          icon={<FaUserMd />}
          color="teal"
          onClick={() => navigate('/traitants')}
          subtitle="Médecins traitants"
        />
        <DashboardCard
          title="RDV à venir"
          value={stats.appointmentsCount}
          icon={<FaCalendarAlt />}
          color="purple"
          onClick={() => navigate('/appointments')}
          highlight={stats.appointmentsCount > 0}
        />
        <DashboardCard
          title="Notifications"
          value={stats.unreadNotifications}
          icon={<FaBell />}
          color="orange"
          onClick={() => navigate('/notifications')}
          highlight={stats.unreadNotifications > 0}
        />
      </div>

      <div className="quick-actions-section">
        <h3>⚡ Actions rapides</h3>
        <PatientQuickActions className="dashboard-quick-actions" />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>🏥 Suivi médical</h3>
          <div className="health-tips">
            <div className="tip-card">
              <FaHeart className="tip-icon" />
              <div className="tip-content">
                <h4>Conseil du jour</h4>
                <p>N'oubliez pas de prendre vos médicaments selon la prescription de votre médecin.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>📊 Activité récente</h3>
          <p>Tableau de bord patient en cours de développement...</p>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
