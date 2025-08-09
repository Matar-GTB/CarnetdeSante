// src/pages/dashboard/MedecinDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MedecinQuickActions from '../../components/role-specific/medecin/MedecinQuickActions';
import DashboardCard from './DashboardCard';
import Loader from '../../components/ui/Loader';
// Suppression de l'import Layout pour éviter la duplication
import './MedecinDashboard.css';
import {
  FaUsers,
  FaCalendarCheck,
  FaStethoscope,
  FaStar,
  FaExclamationTriangle,
  FaUserPlus,
  FaBolt,
  FaChartBar
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
  const [patientsActifs, setPatientsActifs] = useState(0);

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

      // Récupérer les patients et rendez-vous réels
      const traitantService = (await import('../../services/traitantService')).default;
      const appointmentService = (await import('../../services/appointmentService'));
      const patients = await traitantService.getMyPatients();
      const allAppointments = [];
      for (const patient of patients) {
        // Vérifier que l'ID du patient est valide
        if (!patient.id) {
          console.warn('ID patient manquant', patient);
          continue; // Passer au patient suivant
        }
        
        const rdvs = await appointmentService.getAppointmentsByUser(patient.id);
        allAppointments.push(...(rdvs || []).map(rdv => ({...rdv, patientId: patient.id})));
      }
      // On ne garde que les rendez-vous planifiés
      const plannedAppointments = allAppointments.filter(rdv => rdv.statut === 'planifie');
      // On compte le nombre de patients uniques ayant au moins un rendez-vous planifié
      const uniquePatientIds = new Set(plannedAppointments.map(rdv => rdv.patientId));
      setPatientsActifs(uniquePatientIds.size);

      // Calcul du nombre de rendez-vous planifiés pour aujourd'hui
      const today = new Date();
      today.setHours(0,0,0,0);
      const rdvToday = plannedAppointments.filter(rdv => {
        const d = new Date(rdv.date_rendezvous || rdv.date);
        d.setHours(0,0,0,0);
        return d.getTime() === today.getTime();
      });

      // Calcul du nombre de rendez-vous planifiés pour la semaine en cours
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi
      startOfWeek.setHours(0,0,0,0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche
      endOfWeek.setHours(23,59,59,999);
      const rdvWeek = plannedAppointments.filter(rdv => {
        const d = new Date(rdv.date_rendezvous || rdv.date);
        return d >= startOfWeek && d <= endOfWeek;
      });

      // Récupérer les demandes reçues (en attente)
      let pendingRequests = 0;
      if (traitantService.getDemandesPourMedecin) {
        try {
          const demandes = await traitantService.getDemandesPourMedecin();
          pendingRequests = Array.isArray(demandes)
            ? demandes.filter(d => d.statut === 'en_attente').length
            : 0;
        } catch (e) {
          pendingRequests = 0;
        }
      }

      setStats({
        totalPatients: patients.length,
        todayAppointments: rdvToday.length,
        weeklyConsultations: rdvWeek.length,
        averageRating: 4.7,
        pendingRequests
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
    <div className="medecin-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>
            Bonjour Dr {user?.nom || 'Docteur'} ! <span style={{verticalAlign:'middle'}}><FaStethoscope /></span>
          </h1>
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
          value={patientsActifs}
          icon={<FaUsers />}
          color="blue"
          //onClick={() => navigate('/my-patients')}
        />
        <DashboardCard
          title="RDV aujourd'hui"
          value={stats.todayAppointments}
          icon={<FaCalendarCheck />}
          color="green"
          onClick={() => navigate('/medecin/planning')}
          highlight={stats.todayAppointments > 0}
        />
        <DashboardCard
          title="Consultations semaine"
          value={stats.weeklyConsultations}
          icon={<FaStethoscope />}
          color="purple"
          onClick={() => navigate('/medecin/planning')}
          highlight={stats.weeklyConsultations > 0}
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
        <h3><span style={{marginRight:6, color:'#f1c40f'}}><FaBolt /></span>Actions rapides</h3>
        <MedecinQuickActions className="dashboard-quick-actions" />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3><span style={{marginRight:6, color:'#2980b9'}}><FaChartBar /></span>Activité récente</h3>
          <p>Tableau de bord médecin en cours de développement...</p>
        </div>
      </div>
    </div>
  );
};

export default MedecinDashboard;
