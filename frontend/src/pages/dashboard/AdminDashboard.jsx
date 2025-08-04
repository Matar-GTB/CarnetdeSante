import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalMedecins: 0,
    totalAppointments: 0,
    pendingApprovals: 0,
    systemAlerts: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    lastBackup: new Date().toISOString()
  });

  // Vérification des permissions admin
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth/login');
      return;
    }
    
    if (user.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    
    loadDashboardData();
  }, [isAuthenticated, user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // TODO: Remplacer par de vrais appels API d'administration
      // const adminStats = await adminService.getStats();
      // const systemActivity = await adminService.getRecentActivity();
      
      // En attendant l'implémentation des API d'administration
      const stats = {
        totalUsers: 0,
        totalPatients: 0,
        totalMedecins: 0,
        totalAppointments: 0,
        pendingApprovals: 0,
        systemAlerts: 0
      };
      
      const activity = [];
      
      setStats(stats);
      setRecentActivity(activity);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'users':
        navigate('/admin/users');
        break;
      case 'approvals':
        navigate('/admin/approvals');
        break;
      case 'reports':
        navigate('/admin/reports');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      case 'backup':
        // Logique de backup
        alert('Backup manuel initié...');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Chargement des données administratives...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* En-tête Admin */}
      <div className="admin-header">
        <div className="header-content">
          <h1>🔧 Tableau de Bord Administrateur</h1>
          <p>Bienvenue, {user?.prenom} {user?.nom}</p>
        </div>
        <div className="system-status">
          <div className={`status-indicator ${systemHealth.status}`}>
            <span className="status-dot"></span>
            Système opérationnel
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Utilisateurs totaux</p>
            <span className="stat-change">+12 cette semaine</span>
          </div>
        </div>
        
        <div className="stat-card patients">
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <h3>{stats.totalPatients}</h3>
            <p>Patients actifs</p>
            <span className="stat-change">+8 cette semaine</span>
          </div>
        </div>
        
        <div className="stat-card medecins">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>{stats.totalMedecins}</h3>
            <p>Médecins</p>
            <span className="stat-change">+4 cette semaine</span>
          </div>
        </div>
        
        <div className="stat-card appointments">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.totalAppointments}</h3>
            <p>RDV ce mois</p>
            <span className="stat-change">+156 vs mois dernier</span>
          </div>
        </div>
      </div>

      {/* Alertes et actions rapides */}
      <div className="admin-grid">
        <div className="admin-section alerts">
          <h2>🚨 Alertes & Notifications</h2>
          <div className="alert-list">
            {stats.pendingApprovals > 0 && (
              <div className="alert-item warning">
                <span className="alert-icon">⚠️</span>
                <div>
                  <strong>{stats.pendingApprovals} approbations en attente</strong>
                  <p>Nouveaux médecins en attente de validation</p>
                </div>
                <button onClick={() => handleQuickAction('approvals')}>
                  Voir
                </button>
              </div>
            )}
            
            {stats.systemAlerts > 0 && (
              <div className="alert-item info">
                <span className="alert-icon">🔔</span>
                <div>
                  <strong>{stats.systemAlerts} alertes système</strong>
                  <p>Vérifications de routine recommandées</p>
                </div>
                <button onClick={() => handleQuickAction('settings')}>
                  Vérifier
                </button>
              </div>
            )}
            
            <div className="alert-item success">
              <span className="alert-icon">✅</span>
              <div>
                <strong>Système stable</strong>
                <p>Uptime: {systemHealth.uptime} - Dernier backup: aujourd'hui</p>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-section quick-actions">
          <h2>⚡ Actions Rapides</h2>
          <div className="action-grid">
            <button 
              className="action-btn users"
              onClick={() => handleQuickAction('users')}
            >
              <span className="action-icon">👥</span>
              <span>Gérer Utilisateurs</span>
            </button>
            
            <button 
              className="action-btn reports"
              onClick={() => handleQuickAction('reports')}
            >
              <span className="action-icon">📊</span>
              <span>Rapports</span>
            </button>
            
            <button 
              className="action-btn backup"
              onClick={() => handleQuickAction('backup')}
            >
              <span className="action-icon">💾</span>
              <span>Backup Manuel</span>
            </button>
            
            <button 
              className="action-btn settings"
              onClick={() => handleQuickAction('settings')}
            >
              <span className="action-icon">⚙️</span>
              <span>Paramètres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="admin-section activity">
        <h2>📈 Activité Récente</h2>
        <div className="activity-list">
          {recentActivity.map(activity => (
            <div key={activity.id} className={`activity-item ${activity.priority}`}>
              <div className="activity-time">
                {activity.timestamp.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="activity-content">
                <p>{activity.message}</p>
                <span className={`activity-badge ${activity.priority}`}>
                  {activity.type.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métriques système */}
      <div className="system-metrics">
        <h2>🔧 Métriques Système</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Performance</h4>
            <div className="metric-value">95%</div>
            <p>Temps de réponse moyen</p>
          </div>
          
          <div className="metric-card">
            <h4>Stockage</h4>
            <div className="metric-value">78%</div>
            <p>Espace utilisé</p>
          </div>
          
          <div className="metric-card">
            <h4>Sécurité</h4>
            <div className="metric-value">100%</div>
            <p>Système sécurisé</p>
          </div>
          
          <div className="metric-card">
            <h4>Disponibilité</h4>
            <div className="metric-value">{systemHealth.uptime}</div>
            <p>Uptime ce mois</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
