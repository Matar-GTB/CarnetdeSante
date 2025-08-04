// src/components/appointments/AppointmentBooking.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCreneauxDisponibles, createAppointment } from '../../services/appointmentService';
import Loader from '../ui/Loader';
import './AppointmentBooking.css';

const AppointmentBooking = ({ medecin, onSuccess, onCancel }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // États
  const [visibleDays, setVisibleDays] = useState(7);
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedDate, setExpandedDate] = useState('');
  const [creneaux, setCreneaux] = useState({});
  const [selectedHeure, setSelectedHeure] = useState('');
  const [duree, setDuree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Vérification d'authentification
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Vérification du rôle patient
  if (user?.role !== 'patient') {
    return (
      <div className="appointment-booking">
        <div className="error-message">
          ⚠️ Seuls les patients peuvent prendre des rendez-vous
        </div>
      </div>
    );
  }

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
      const res = await getCreneauxDisponibles(medecin.id, iso);
      const data = res.data ? res.data : res;

      if (!data?.creneaux || data.travail === false) {
        setCreneaux(prev => ({ ...prev, [iso]: [] }));
        setDuree(null);
        return;
      }

      setCreneaux(prev => ({ ...prev, [iso]: data.creneaux }));
      setDuree(data.duree);
    } catch (err) {
      console.error('Erreur lors de la récupération des créneaux :', err);
      setError('Erreur lors du chargement des créneaux');
      setCreneaux(prev => ({ ...prev, [iso]: [] }));
      setDuree(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedHeure || !duree) {
      setError("Veuillez sélectionner une date et un créneau horaire.");
      return;
    }

    setSubmitting(true);
    setError('');

    const heureFin = addMinutes(selectedHeure, duree);
    
    try {
      const result = await createAppointment({
        patient_id: user?.id,
        medecin_id: medecin.id,
        date_rendezvous: selectedDate,
        heure_debut: selectedHeure,
        heure_fin: heureFin,
        type_rendezvous: 'consultation',
        notes: ''
      });

      // Appeler la callback de succès
      if (onSuccess) {
        onSuccess(result);
      }

    } catch (error) {
      console.error('Erreur lors de la prise de rendez-vous:', error);
      
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

  const addMinutes = (time, minsToAdd) => {
    if (!time || !minsToAdd) return '';
    const [h, m] = time.split(':').map(Number);
    const date = new Date(0, 0, 0, h, m);
    date.setMinutes(date.getMinutes() + minsToAdd - 1);
    return date.toTimeString().slice(0, 5);
  };

  return (
    <div className="appointment-booking">
      {onCancel && (
        <button
          className="back-button"
          onClick={onCancel}
        >
          ← Retour
        </button>
      )}
      
      <div className="booking-header">
        <h3>Prendre rendez-vous avec Dr. {medecin.nom} {medecin.prenom}</h3>
        {medecin.specialite && <p className="medecin-specialite">{medecin.specialite}</p>}
      </div>

      {/* Messages d'état */}
      {error && <div className="error-message">{error}</div>}

      <h4>Choisissez votre date de consultation</h4>
      
      <div className="dates-container">
        {generateDates().map(({ iso, label }) => (
          <div key={iso} className="date-card">
            <button className="date-button" onClick={() => handleDateClick(iso)}>
              <span>{label}</span>
              <span className={`chevron-icon ${expandedDate === iso ? 'rotate' : ''}`}>▼</span>
            </button>
            
            {expandedDate === iso && (
              <div className="slots-container">
                {loading && expandedDate === iso && (
                  <div className="slots-loading">
                    <Loader message="Chargement des créneaux..." />
                  </div>
                )}
                
                {!loading && creneaux[iso] === undefined && (
                  <p className="no-slot">Chargement...</p>
                )}

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
      </div>

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
        onClick={handleSubmit} 
        disabled={!selectedDate || !selectedHeure || !duree || submitting}
      >
        {submitting ? '⏳ Confirmation...' : '✅ Confirmer le rendez-vous'}
      </button>

      {selectedDate && selectedHeure && duree && (
        <div className="booking-summary">
          <h5>📅 Résumé de votre rendez-vous :</h5>
          <p><strong>Date :</strong> {new Date(selectedDate).toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</p>
          <p><strong>Heure :</strong> {selectedHeure}</p>
          <p><strong>Durée :</strong> {duree} minutes</p>
          <p><strong>Médecin :</strong> Dr. {medecin.nom} {medecin.prenom}</p>
          {medecin.etablissements && (
            <p><strong>Lieu :</strong> {medecin.etablissements}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;
