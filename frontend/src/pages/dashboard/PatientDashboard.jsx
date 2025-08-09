// src/pages/dashboard/PatientDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PatientQuickActions from '../../components/role-specific/patient/PatientQuickActions';
import DashboardCard from './DashboardCard';
import Loader from '../../components/ui/Loader';
// Suppression de l'import Layout pour éviter la duplication
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
      
      // Import dynamique des services nécessaires
      const medicationService = await import('../../services/medicationService');
      const documentService = await import('../../services/documentService');
      const appointmentService = await import('../../services/appointmentService');
      const notificationService = await import('../../services/notificationService');
      const profileService = await import('../../services/profileService');
      
      // Récupération des vraies données en parallèle pour optimiser le chargement
      const [medications, documents, notifications, traitants] = await Promise.all([
        medicationService.getMedicationsApi().catch(err => {
          console.error('Erreur lors du chargement des médicaments:', err);
          return [];
        }),
        documentService.getUserDocuments().catch(err => {
          console.error('Erreur lors du chargement des documents:', err);
          return { data: [] };
        }),
        notificationService.getNotificationsApi().catch(err => {
          console.error('Erreur lors du chargement des notifications:', err);
          return [];
        }),
        profileService.getMesTraitants().catch(err => {
          console.error('Erreur lors du chargement des médecins traitants:', err);
          return { data: [] };
        })
      ]);
      
      // Récupération des rendez-vous à venir (uniquement)
      const allAppointments = await appointmentService.getAppointmentsByUser(user?.id).catch(err => {
        console.error('Erreur lors du chargement des rendez-vous:', err);
        return [];
      });
      
      // Filtrer uniquement les rendez-vous à venir
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcomingAppointments = Array.isArray(allAppointments) 
        ? allAppointments.filter(rdv => {
            const rdvDate = new Date(rdv.date_rendezvous || rdv.date);
            return rdvDate >= today && rdv.statut !== 'annule' && rdv.statut !== 'termine';
          })
        : [];
      
      // Filtrer les notifications non lues
      const unreadNotifications = Array.isArray(notifications) 
        ? notifications.filter(notif => !notif.est_lu) 
        : [];
      
      // Mise à jour des statistiques avec les vraies données
      setStats({
        medicationsCount: Array.isArray(medications) ? medications.length : 0,
        documentsCount: documents.data?.length || 0,
        appointmentsCount: upcomingAppointments.length,
        unreadNotifications: unreadNotifications.length,
        traitantsCount: traitants.data?.length || 0
      });
      
      setLoading(false);
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
