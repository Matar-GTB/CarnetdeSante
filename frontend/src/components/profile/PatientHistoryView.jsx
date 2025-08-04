// components/profile/PatientHistoryView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PatientHistoryView.css';

const PatientHistoryView = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    dateFrom: '',
    dateTo: '',
    medecin: 'all'
  });

  const loadPatientHistory = useCallback(async () => {
    try {
      setLoading(true);
      
      // TODO: Remplacer par de vrais appels API
      // const patientData = await profileService.getPatientProfile(patientId);
      // const historyData = await medicalService.getPatientHistory(patientId);
      
      // En attendant l'implémentation des vraies API, données temporaires
      const patient = {
        id: patientId,
        nom: '',
        prenom: '',
        age: 0,
        email: ''
      };

      const history = [];

      setPatient(patient);
      setHistory(history);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setLoading(false);
    }
  }, [patientId]);

  const filterHistory = useCallback(() => {
    let filtered = [...history];

    // Filtrer par type
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    // Filtrer par date
    if (filters.dateFrom) {
      filtered = filtered.filter(item => new Date(item.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(item => new Date(item.date) <= new Date(filters.dateTo));
    }

    // Filtrer par médecin
    if (filters.medecin !== 'all') {
      filtered = filtered.filter(item => item.medecin.includes(filters.medecin));
    }

    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredHistory(filtered);
  }, [history, filters]);

  useEffect(() => {
    loadPatientHistory();
  }, [loadPatientHistory]);

  useEffect(() => {
    filterHistory();
  }, [filterHistory]);

  useEffect(() => {
    filterHistory();
  }, [history, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'consultation': return '👨‍⚕️';
      case 'prescription': return '💊';
      case 'test': return '🔬';
      default: return '📋';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'consultation': return 'Consultation';
      case 'prescription': return 'Prescription';
      case 'test': return 'Examen';
      default: return 'Autre';
    }
  };

  if (loading) {
    return (
      <div className="patient-history-view">
        <div className="history-container">
          <div className="history-loading">
            <div className="loading-spinner"></div>
            <p>Chargement de l'historique...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-history-view">
        <div className="history-container">
          <div className="history-loading">
            <p>Patient non trouvé</p>
            <button className="btn-back" onClick={() => navigate('/medecin/patients')}>
              ← Retour aux patients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-history-view">
      <div className="history-container">
        {/* Header */}
        <div className="history-header">
          <div className="header-info">
            <h1>Historique médical - {patient.prenom} {patient.nom}</h1>
            <p>Patient ID: {patient.id} • {history.length} entrée(s) au total</p>
          </div>
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Retour
          </button>
        </div>

        {/* Filtres */}
        <div className="filter-section">
          <div className="filter-grid">
            <div className="filter-group">
              <label>Type d'événement</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">Tous les types</option>
                <option value="consultation">Consultations</option>
                <option value="prescription">Prescriptions</option>
                <option value="test">Examens</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Date de début</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Date de fin</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <button className="btn-filter" onClick={filterHistory}>
              Filtrer
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="history-timeline">
          <div className="timeline-header">
            <h2>
              📋 Historique médical
            </h2>
            <div className="timeline-stats">
              <div className="stat-item">
                <div className="stat-number">{filteredHistory.length}</div>
                <div className="stat-label">Événements</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {filteredHistory.filter(item => item.type === 'consultation').length}
                </div>
                <div className="stat-label">Consultations</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {filteredHistory.filter(item => item.type === 'prescription').length}
                </div>
                <div className="stat-label">Prescriptions</div>
              </div>
            </div>
          </div>

          <div className="timeline-content">
            <div className="timeline-line"></div>
            
            {filteredHistory.length === 0 ? (
              <div className="empty-history">
                <div className="empty-icon">📭</div>
                <h3>Aucun événement trouvé</h3>
                <p>Aucun événement ne correspond aux critères de filtrage sélectionnés.</p>
              </div>
            ) : (
              filteredHistory.map((item, index) => (
                <div key={item.id} className="timeline-item">
                  <div className={`timeline-marker ${item.type}`}>
                    {getTypeIcon(item.type)}
                  </div>
                  
                  <div className="timeline-item-header">
                    <div>
                      <h3 className="item-title">{item.title}</h3>
                      <p className="item-date">{formatDate(item.date)}</p>
                    </div>
                    <span className={`item-type ${item.type}`}>
                      {getTypeLabel(item.type)}
                    </span>
                  </div>

                  <div className="item-content">
                    <p><strong>Médecin:</strong> {item.medecin}</p>
                    <p>{item.content}</p>
                  </div>

                  {item.details && (
                    <div className="item-details">
                      <div className="detail-grid">
                        {Object.entries(item.details).map(([key, value]) => (
                          <div key={key} className="detail-item">
                            <span className="detail-label">
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </span>
                            <span className="detail-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryView;
