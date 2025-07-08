import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import UserMenu from './UserMenu';
import { 
  FaCalendarCheck, 
  FaFileMedical, 
  FaSyringe, 
  FaNotesMedical, 
  FaExclamationTriangle,
  FaUserMd,
  FaShareAlt
} from 'react-icons/fa';

import { 
  getUpcomingAppointments,
  getRecentDocuments,
  getVaccinations,
  getHealthAlerts
} from '../services/dashboardService';

export default function Dashboard({ user, setPage }) {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données du tableau de bord
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Charger toutes les données en parallèle
        const [appointments, documents, vaccins, alerts] = await Promise.all([
          getUpcomingAppointments(user.id),
          getRecentDocuments(user.id),
          getVaccinations(user.id),
          getHealthAlerts(user.id)
        ]);

        setUpcomingAppointments(appointments);
        setRecentDocuments(documents);
        setVaccinations(vaccins);
        setHealthAlerts(alerts);
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        // Gérer les erreurs ici
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Chargement de vos données médicales...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* En-tête */}
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Bonjour {user?.firstname || 'Patient'}, <span>comment allez-vous aujourd'hui?</span></h1>
          <p>Dernière connexion: {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <UserMenu 
          user={user} 
          onLogout={() => setPage('login')} 
          onNavigate={setPage} 
        />
      </header>

      {/* Section d'alertes importantes */}
      {healthAlerts.length > 0 && (
        <div className="alert-banner">
          <FaExclamationTriangle className="alert-icon" />
          <p>{healthAlerts[0].message}</p>
          <button 
            className="btn-alert"
            onClick={() => setPage('rendezvous')}
          >
            Prendre rendez-vous
          </button>
        </div>
      )}

      {/* Grille principale */}
      <div className="dashboard-grid">
        {/* Colonne 1: Rendez-vous et actions rapides */}
        <div className="dashboard-column">
          {/* Prochain rendez-vous */}
          <section className="dashboard-card appointments">
            <div className="card-header">
              <FaCalendarCheck className="card-icon" />
              <h2>Prochains rendez-vous</h2>
            </div>
            
            {upcomingAppointments.length > 0 ? (
              <div className="appointments-list">
                {upcomingAppointments.map(app => (
                  <div key={app.id} className="appointment-item">
                    <div className="app-date">
                      <span className="date">{formatDate(app.date)}</span>
                      <span className="time">{app.heure}</span>
                    </div>
                    <div className="app-details">
                      <h3>{app.medecin_nom}</h3>
                      <p>{app.type}</p>
                    </div>
                    <button 
                      className="btn-action"
                      onClick={() => setPage('rendezvous')}
                    >
                      Détails
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucun rendez-vous prévu</p>
                <button 
                  className="btn-primary" 
                  onClick={() => setPage('rendezvous')}
                >
                  Prendre rendez-vous
                </button>
              </div>
            )}
          </section>

          {/* Actions rapides */}
          <section className="dashboard-card quick-actions">
            <div className="card-header">
              <h2>Actions rapides</h2>
            </div>
            <div className="actions-grid">
              <button 
                className="action-btn" 
                onClick={() => setPage('documents')}
              >
                <FaFileMedical />
                <span>Ajouter un document</span>
              </button>
              <button 
                className="action-btn" 
                onClick={() => setPage('rendezvous')}
              >
                <FaCalendarCheck />
                <span>Prendre RDV</span>
              </button>
              <button 
                className="action-btn" 
                onClick={() => setPage('partage')}
              >
                <FaShareAlt />
                <span>Partager mon dossier</span>
              </button>
              <button 
                className="action-btn" 
                onClick={() => setPage('recherche-medecin')}
              >
                <FaUserMd />
                <span>Trouver un médecin</span>
              </button>
            </div>
          </section>
        </div>

        {/* Colonne 2: Documents et santé */}
        <div className="dashboard-column">
          {/* Derniers documents */}
          <section className="dashboard-card documents">
            <div className="card-header">
              <FaFileMedical className="card-icon" />
              <h2>Derniers documents</h2>
              <button 
                className="btn-link" 
                onClick={() => setPage('documents')}
              >
                Voir tout
              </button>
            </div>
            
            {recentDocuments.length > 0 ? (
              <div className="documents-list">
                {recentDocuments.map(doc => (
                  <div key={doc.id} className="document-item">
                    <div className="doc-type">{doc.type}</div>
                    <div className="doc-details">
                      <h3>{doc.nom}</h3>
                      <p>Ajouté le {formatDate(doc.date)}</p>
                    </div>
                    <button 
                      className="btn-action"
                      onClick={() => setPage('documents')}
                    >
                      Consulter
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucun document disponible</p>
                <button 
                  className="btn-primary" 
                  onClick={() => setPage('documents')}
                >
                  Ajouter un document
                </button>
              </div>
            )}
          </section>

          {/* Vaccinations */}
          <section className="dashboard-card vaccinations">
            <div className="card-header">
              <FaSyringe className="card-icon" />
              <h2>Vaccinations</h2>
              <button 
                className="btn-link" 
                onClick={() => setPage('vaccinations')}
              >
                Voir tout
              </button>
            </div>
            
            {vaccinations.length > 0 ? (
              <div className="vaccination-list">
                {vaccinations.slice(0, 2).map(vac => (
                  <div key={vac.id} className="vaccination-item">
                    <h3>{vac.nom}</h3>
                    <div className="vac-dates">
                      <div>
                        <span>Dernière dose</span>
                        <strong>{formatDate(vac.date)}</strong>
                      </div>
                      {vac.rappel && (
                        <div>
                          <span>Prochain rappel</span>
                          <strong>{formatDate(vac.rappel)}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucune vaccination enregistrée</p>
                <button 
                  className="btn-primary" 
                  onClick={() => setPage('vaccinations')}
                >
                  Ajouter une vaccination
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Colonne 3: Santé et informations */}
        <div className="dashboard-column">
          {/* Informations santé */}
          <section className="dashboard-card health-info">
            <div className="card-header">
              <FaNotesMedical className="card-icon" />
              <h2>Votre santé en bref</h2>
            </div>
            
            <div className="health-summary">
              {user.groupe_sanguin && (
                <div className="summary-item">
                  <span>Groupe sanguin</span>
                  <strong>{user.groupe_sanguin}</strong>
                </div>
              )}
              
              {user.allergies && (
                <div className="summary-item">
                  <span>Allergies</span>
                  <strong>{user.allergies}</strong>
                </div>
              )}
              
              {user.antecedents && (
                <div className="summary-item">
                  <span>Antécédents</span>
                  <strong>{user.antecedents}</strong>
                </div>
              )}
              
              {user.sexe && (
                <div className="summary-item">
                  <span>Sexe</span>
                  <strong>{user.sexe === 'M' ? 'Masculin' : 'Féminin'}</strong>
                </div>
              )}
            </div>
            
            <button 
              className="btn-primary" 
              onClick={() => setPage('profile')}
            >
              Mettre à jour mon profil
            </button>
          </section>

          {/* Alertes santé */}
          {healthAlerts.length > 0 && (
            <section className="dashboard-card health-alerts">
              <div className="card-header">
                <FaExclamationTriangle className="card-icon" />
                <h2>Alertes importantes</h2>
              </div>
              
              <div className="alerts-list">
                {healthAlerts.map((alert, index) => (
                  <div key={index} className="alert-item">
                    <div className="alert-badge">{alert.type}</div>
                    <p>{alert.message}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trouver un médecin */}
          <section className="dashboard-card find-doctor">
            <div className="card-header">
              <FaUserMd className="card-icon" />
              <h2>Besoin d'un spécialiste?</h2>
            </div>
            
            <p>Trouvez le professionnel de santé adapté à vos besoins</p>
            
            <button 
              className="btn-primary" 
              onClick={() => setPage('recherche-medecin')}
            >
              Rechercher un médecin
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}