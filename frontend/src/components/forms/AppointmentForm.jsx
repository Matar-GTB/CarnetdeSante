import React, { useState, useEffect } from 'react';
import { createAppointment } from '../../services/appointmentService';
import './AppointmentForm.css';

const AppointmentForm = ({ 
  patient, 
  medecin, 
  onSuccess, 
  onError, 
  onCancel,
  initialData = null 
}) => {
  const [formData, setFormData] = useState({
    date_rendezvous: '',
    heure_debut: '',
    type_rendezvous: 'consultation',
    notes: '',
    duree: 30
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const appointmentTypes = [
    { value: 'consultation', label: '🏥 Consultation générale' },
    { value: 'controle', label: '🔍 Visite de contrôle' },
    { value: 'urgence', label: '🚨 Urgence' },
    { value: 'suivi', label: '📋 Suivi médical' },
    { value: 'prevention', label: '🛡️ Prévention' },
    { value: 'vaccination', label: '💉 Vaccination' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date_rendezvous) {
      newErrors.date_rendezvous = 'La date est obligatoire';
    } else {
      const selectedDate = new Date(formData.date_rendezvous);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date_rendezvous = 'La date ne peut pas être dans le passé';
      }
    }
    
    if (!formData.heure_debut) {
      newErrors.heure_debut = 'L\'heure est obligatoire';
    }
    
    if (!formData.type_rendezvous) {
      newErrors.type_rendezvous = 'Le type de rendez-vous est obligatoire';
    }
    
    if (formData.duree < 15 || formData.duree > 120) {
      newErrors.duree = 'La durée doit être entre 15 et 120 minutes';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const appointmentData = {
        ...formData,
        patient_id: patient?.id,
        medecin_id: medecin?.id,
        heure_fin: calculateEndTime(formData.heure_debut, formData.duree)
      };
      
      const response = await createAppointment(appointmentData);
      
      if (onSuccess) {
        onSuccess(response.data || response);
      }
      
    } catch (error) {
      console.error('Erreur lors de la création du RDV:', error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    
    return endDate.toTimeString().slice(0, 5);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="appointment-form-container">
      <div className="form-header">
        <h3>📅 {initialData ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}</h3>
        {patient && medecin && (
          <div className="appointment-participants">
            <div className="participant">
              <strong>Patient :</strong> {patient.prenom} {patient.nom}
            </div>
            <div className="participant">
              <strong>Médecin :</strong> Dr. {medecin.nom} {medecin.prenom}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="date_rendezvous">Date du rendez-vous *</label>
            <input
              type="date"
              id="date_rendezvous"
              name="date_rendezvous"
              value={formData.date_rendezvous}
              onChange={handleInputChange}
              min={getMinDate()}
              className={errors.date_rendezvous ? 'error' : ''}
              required
            />
            {errors.date_rendezvous && (
              <span className="error-text">{errors.date_rendezvous}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="heure_debut">Heure de début *</label>
            <input
              type="time"
              id="heure_debut"
              name="heure_debut"
              value={formData.heure_debut}
              onChange={handleInputChange}
              className={errors.heure_debut ? 'error' : ''}
              required
            />
            {errors.heure_debut && (
              <span className="error-text">{errors.heure_debut}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="duree">Durée (minutes) *</label>
            <select
              id="duree"
              name="duree"
              value={formData.duree}
              onChange={handleInputChange}
              className={errors.duree ? 'error' : ''}
              required
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 heure</option>
              <option value={90}>1h30</option>
              <option value={120}>2 heures</option>
            </select>
            {errors.duree && (
              <span className="error-text">{errors.duree}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="type_rendezvous">Type de consultation *</label>
            <select
              id="type_rendezvous"
              name="type_rendezvous"
              value={formData.type_rendezvous}
              onChange={handleInputChange}
              className={errors.type_rendezvous ? 'error' : ''}
              required
            >
              {appointmentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type_rendezvous && (
              <span className="error-text">{errors.type_rendezvous}</span>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="notes">Notes complémentaires</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Précisions sur la consultation, symptômes, demandes particulières..."
            rows={4}
          />
        </div>

        {/* Résumé du rendez-vous */}
        {formData.date_rendezvous && formData.heure_debut && formData.duree && (
          <div className="appointment-summary">
            <h4>📋 Résumé du rendez-vous</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <strong>Date :</strong> 
                {new Date(formData.date_rendezvous).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <div className="summary-item">
                <strong>Heure :</strong> 
                {formData.heure_debut} - {calculateEndTime(formData.heure_debut, formData.duree)}
              </div>
              <div className="summary-item">
                <strong>Durée :</strong> {formData.duree} minutes
              </div>
              <div className="summary-item">
                <strong>Type :</strong> 
                {appointmentTypes.find(t => t.value === formData.type_rendezvous)?.label}
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>⏳ {initialData ? 'Modification...' : 'Création...'}</>
            ) : (
              <>✅ {initialData ? 'Modifier' : 'Créer'} le rendez-vous</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
