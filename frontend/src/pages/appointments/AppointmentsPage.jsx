// src/pages/appointments/AppointmentsPage.jsx
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  getAppointmentsByUser, 
  cancelAppointment,
  getCreneauxDisponibles,
  createAppointment
} from '../../services/appointmentService';
import { getAllMedecins } from '../../services/traitantService';
import Loader from '../../components/ui/Loader';
import './AppointmentsPage.css';

const AppointmentsPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const userId = user?.id;
  const wrapperRef = useRef(null);

  // États principaux
  const [activeTab, setActiveTab] = useState('list');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  // États pour nouveau RDV
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [visibleDays, setVisibleDays] = useState(7);
  const [creneaux, setCreneaux] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedDate, setExpandedDate] = useState('');
  const [selectedHeure, setSelectedHeure] = useState('');
  const [duree, setDuree] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // États pour modale d'annulation - supprimés car non utilisés

  // Fonction réutilisable pour recharger les rendez-vous
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAppointmentsByUser(userId);
      setAppointments(data || []);
    } catch (error) {
      console.error('Erreur chargement RDV:', error);
      setError('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Vérification des permissions
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth/login');
      return;
    }
    
    if (user.role !== 'patient') {
      setError('Seuls les patients peuvent accéder aux rendez-vous');
      return;
    }

    const loadDoctors = async () => {
      try {
        const data = await getAllMedecins();
        setDoctors(data || []);
      } catch (error) {
        console.error('Erreur chargement médecins:', error);
      }
    };
    
    const initData = async () => {
      await loadAppointments();
      await loadDoctors();
    };
    
    initData();
  }, [isAuthenticated, user, navigate, userId, loadAppointments]);

  // Gestion des suggestions
  useEffect(() => {
    if (query.length >= 2) {
      const filtered = doctors.filter(doc =>
        `${doc.prenom} ${doc.nom}`.toLowerCase().includes(query.toLowerCase()) ||
        doc.specialite?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, doctors]);

  // Click en dehors pour fermer suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCancelAppointment = async (appointmentId, reason = '') => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }
    
    try {
      setCancellingId(appointmentId);
      await cancelAppointment(appointmentId, reason);
      setSuccess('Rendez-vous annulé avec succès');
      loadAppointments();
    } catch (error) {
      console.error('Erreur annulation:', error);
      setError('Erreur lors de l\'annulation du rendez-vous');
    } finally {
      setCancellingId(null);
    }
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setQuery(`Dr. ${doctor.nom} ${doctor.prenom}`);
    setSuggestions([]);
    resetDates();
    setActiveTab('booking');
  };

  const resetDates = () => {
    setCreneaux({});
    setSelectedDate('');
    setExpandedDate('');
    setSelectedHeure('');
    setDuree(null);
  };

  const generateDates = () => {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < visibleDays; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const label = d.toLocaleDateString('fr-FR', options);
      dates.push({ label, iso: d.toISOString().split('T')[0] });
    }
    return dates;
  };

  const handleDateClick = async (iso) => {
    if (expandedDate === iso) {
      setExpandedDate('');
      return;
    }

    setExpandedDate(iso);
    setSelectedHeure('');
    setSelectedDate(iso);
    setError('');
    setLoading(true);

    try {
      const res = await getCreneauxDisponibles(selectedDoctor.id, iso);
      const data = res.data ? res.data : res;

      if (!data?.creneaux || data.travail === false) {
        setCreneaux(prev => ({ ...prev, [iso]: [] }));
        setDuree(null);
        return;
      }

      setCreneaux(prev => ({ ...prev, [iso]: data.creneaux }));
      setDuree(data.duree);
    } catch (err) {
      console.error('Erreur créneaux:', err);
      setError('Erreur lors du chargement des créneaux');
      setCreneaux(prev => ({ ...prev, [iso]: [] }));
      setDuree(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAppointment = async () => {
    if (!selectedDate || !selectedHeure || !duree) {
      setError("Veuillez sélectionner une date et un créneau horaire.");
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    const heureFin = addMinutes(selectedHeure, duree);
    
    try {
      await createAppointment({
        patient_id: user?.id,
        medecin_id: selectedDoctor.id,
        date_rendezvous: selectedDate,
        heure_debut: selectedHeure,
        heure_fin: heureFin,
        type_rendezvous: 'consultation',
        notes: ''
      });

      setSuccess('✅ Rendez-vous confirmé ! Vous recevrez une confirmation par email.');
      
      // Reset et retour à la liste
      setTimeout(() => {
        resetDates();
        setSelectedDoctor(null);
        setQuery('');
        setSuccess('');
        setActiveTab('list');
        loadAppointments();
      }, 2000);

    } catch (error) {
      console.error('Erreur création RDV:', error);
      
      if (error.response?.status === 409) {
        setError('⚠️ Ce créneau est déjà réservé. Veuillez en choisir un autre.');
      } else if (error.response?.status === 400) {
        setError('⚠️ Données invalides. Veuillez vérifier vos informations.');
      } else {
        setError("❌ Une erreur est survenue lors de la prise de rendez-vous. Veuillez réessayer.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Utilitaires
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString?.slice(0, 5) || '';
  };

  const getAppointmentStatus = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(`${appointment.date_rendezvous}T${appointment.heure_debut}`);
    
    if (appointment.statut === 'annule') return 'cancelled';
    if (appointmentDate < now) return 'past';
    
    const hoursUntil = (appointmentDate - now) / (1000 * 60 * 60);
    if (hoursUntil <= 24) return 'soon';
    
    return 'upcoming';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'upcoming': return 'À venir';
      case 'soon': return 'Bientôt';
      case 'past': return 'Passés';
      case 'cancelled': return 'Annulés';
      default: return 'Tous';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return getAppointmentStatus(appointment) === filter;
  });

  const canCancelAppointment = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(`${appointment.date_rendezvous}T${appointment.heure_debut}`);
    const hoursUntil = (appointmentDate - now) / (1000 * 60 * 60);
    
    return appointment.statut !== 'annule' && hoursUntil > 24;
  };

  const addMinutes = (time, minsToAdd) => {
    if (!time || !minsToAdd) return '';
    const [h, m] = time.split(':').map(Number);
    const date = new Date(0, 0, 0, h, m);
    date.setMinutes(date.getMinutes() + minsToAdd - 1);
    return date.toTimeString().slice(0, 5);
  };

  if (loading && activeTab === 'list') {
    return (
      <div className="appointments-page loading">
        <Loader message="Chargement de vos rendez-vous..." />
      </div>
    );
  }

  return (
    <div className="appointments-page">
      {/* En-tête */}
      <div className="page-header">
        <div className="header-content">
          <h1>📅 Mes Rendez-vous</h1>
          <p>Gérez vos consultations médicales</p>
        </div>
        <button 
          className="new-appointment-btn"
          onClick={() => setActiveTab('search')}
        >
          ➕ Nouveau RDV
        </button>
      </div>

      {/* Onglets */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Mes RDV
        </button>
        <button 
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Nouveau RDV
        </button>
      </div>

      {/* Messages d'état */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'list' && (
        <>
          {/* Filtres */}
          <div className="filters-section">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tous ({appointments.length})
              </button>
              <button 
                className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                À venir ({appointments.filter(a => getAppointmentStatus(a) === 'upcoming').length})
              </button>
              <button 
                className={`filter-tab ${filter === 'soon' ? 'active' : ''}`}
                onClick={() => setFilter('soon')}
              >
                Bientôt ({appointments.filter(a => getAppointmentStatus(a) === 'soon').length})
              </button>
              <button 
                className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
                onClick={() => setFilter('past')}
              >
                Passés ({appointments.filter(a => getAppointmentStatus(a) === 'past').length})
              </button>
            </div>
          </div>

          {/* Liste des rendez-vous */}
          <div className="appointments-list">
            {filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>Aucun rendez-vous</h3>
                <p>
                  {filter === 'all' 
                    ? 'Vous n\'avez pas encore de rendez-vous programmés.'
                    : `Aucun rendez-vous dans la catégorie "${getStatusLabel(filter)}".`
                  }
                </p>
                <button 
                  className="action-btn btn-primary"
                  onClick={() => setActiveTab('search')}
                >
                  Prendre un rendez-vous
                </button>
              </div>
            ) : (
              filteredAppointments.map(appointment => {
                const status = getAppointmentStatus(appointment);
                return (
                  <div key={appointment.id} className={`appointment-card ${status}`}>
                    <div className="appointment-header">
                      <div className="appointment-date">
                        <div className="date-day">
                          {new Date(appointment.date_rendezvous).getDate()}
                        </div>
                        <div className="date-month">
                          {new Date(appointment.date_rendezvous).toLocaleDateString('fr-FR', { month: 'short' })}
                        </div>
                      </div>
                      
                      <div className="appointment-info">
                        <h3>Dr. {appointment.Medecin?.nom} {appointment.Medecin?.prenom}</h3>
                        {appointment.Medecin?.specialite && (
                          <p className="specialite">{appointment.Medecin.specialite}</p>
                        )}
                        <div className="appointment-details">
                          <span>🕒 {formatTime(appointment.heure_debut)}</span>
                          <span>📍 {appointment.Medecin?.etablissements || 'Cabinet médical'}</span>
                        </div>
                      </div>
                      
                      <div className="appointment-status">
                        <span className={`status-badge ${status}`}>
                          {getStatusLabel(status)}
                        </span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="appointment-notes">
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    )}

                    <div className="appointment-actions">
                      <button 
                        className="action-btn btn-secondary"
                        onClick={() => navigate(`/doctors/${appointment.medecin_id}/public`)}
                      >
                        👤 Voir profil
                      </button>
                      
                      {canCancelAppointment(appointment) && (
                        <button 
                          className="action-btn btn-danger"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          disabled={cancellingId === appointment.id}
                        >
                          {cancellingId === appointment.id ? '⏳ Annulation...' : '❌ Annuler'}
                        </button>
                      )}
                    </div>

                    {status === 'soon' && (
                      <div className="soon-notice">
                        ⚠️ Ce rendez-vous approche ! Pensez à vous y préparer.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Statistiques */}
          {appointments.length > 0 && (
            <div className="appointments-stats">
              <h3>📊 Vos statistiques</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{appointments.length}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {appointments.filter(a => getAppointmentStatus(a) === 'upcoming').length}
                  </span>
                  <span className="stat-label">À venir</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {appointments.filter(a => getAppointmentStatus(a) === 'past').length}
                  </span>
                  <span className="stat-label">Terminés</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'search' && (
        <div className="search-section">
          <h2>🔍 Rechercher un médecin</h2>
          
          <div className="autocomplete-wrapper" ref={wrapperRef}>
            <input
              type="text"
              placeholder="Nom du médecin ou spécialité..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map(doctor => (
                  <li 
                    key={doctor.id} 
                    className="suggestion-item"
                    onClick={() => handleSelectDoctor(doctor)}
                  >
                    <img 
                      src={doctor.photo_profil || '/images/avatar.png'} 
                      alt={`Dr. ${doctor.nom}`}
                      className="suggestion-photo"
                    />
                    <div className="suggestion-info">
                      <strong>Dr. {doctor.nom} {doctor.prenom}</strong>
                      {doctor.specialite && <span className="suggestion-specialite">{doctor.specialite}</span>}
                    </div>
                    <button 
                      className="profile-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/doctors/${doctor.id}/public`);
                      }}
                    >
                      Profil
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === 'booking' && selectedDoctor && (
        <div className="booking-section">
          <button
            className="back-button"
            onClick={() => setActiveTab('search')}
          >
            ← Retour à la recherche
          </button>
          
          <div className="booking-header">
            <h3>Prendre rendez-vous avec Dr. {selectedDoctor.nom} {selectedDoctor.prenom}</h3>
            {selectedDoctor.specialite && <p className="medecin-specialite">{selectedDoctor.specialite}</p>}
          </div>

          <h4>Choisissez votre date de consultation</h4>
          {generateDates().map(({ iso, label }) => (
            <div key={iso} className="date-card">
              <button className="date-button" onClick={() => handleDateClick(iso)}>
                <span>{label}</span>
                <span className={`chevron-icon ${expandedDate === iso ? 'rotate' : ''}`}>▼</span>
              </button>
              {expandedDate === iso && (
                <div className="slots-list">
                  {loading && expandedDate === iso && <Loader message="Chargement des créneaux..." />}
                  
                  {!loading && creneaux[iso] === undefined && <p className="no-slot">Chargement...</p>}

                  {!loading && creneaux[iso] && creneaux[iso].length > 0 && (
                    <div className="slots-grid">
                      {creneaux[iso].map((heure, i) => (
                        <button
                          key={i}
                          className={`slot-button ${selectedHeure === heure ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedDate(iso);
                            setSelectedHeure(heure);
                            setError('');
                          }}
                        >
                          {heure}
                        </button>
                      ))}
                    </div>
                  )}

                  {!loading && creneaux[iso] && creneaux[iso].length === 0 && (
                    <p className="no-slot">❌ Aucun créneau disponible ce jour</p>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="date-actions">
            {visibleDays > 7 && (
              <button
                className="toggle-btn"
                onClick={() => setVisibleDays(prev => Math.max(7, prev - 7))}
              >
                Voir moins
              </button>
            )}
            <button
              className="toggle-btn"
              onClick={() => setVisibleDays(prev => prev + 7)}
            >
              Voir plus de dates
            </button>
          </div>

          <button 
            className="validate-button" 
            onClick={handleSubmitAppointment} 
            disabled={!selectedDate || !selectedHeure || !duree || submitting}
          >
            {submitting ? '⏳ Confirmation...' : '✅ Confirmer le rendez-vous'}
          </button>

          {selectedDate && selectedHeure && duree && (
            <div className="booking-summary">
              <h5>📅 Résumé de votre rendez-vous :</h5>
              <p><strong>Date :</strong> {formatDate(selectedDate)}</p>
              <p><strong>Heure :</strong> {selectedHeure}</p>
              <p><strong>Durée :</strong> {duree} minutes</p>
              <p><strong>Médecin :</strong> Dr. {selectedDoctor.nom} {selectedDoctor.prenom}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
