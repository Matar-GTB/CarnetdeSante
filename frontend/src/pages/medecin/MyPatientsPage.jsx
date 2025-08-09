// pages/medecin/MyPatientsPage.jsx
import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle, FaEye, FaBookMedical, FaTrashAlt, FaNotesMedical, FaUsers, FaSearch, FaTimes, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import traitantService from '../../services/traitantService';
// import { getConsultationsByPatient } from '../../services/consultationService';
import { getAppointmentsByUser } from '../../services/appointmentService';
import './MyPatientsPage.css';

const MyPatientsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [patientToRemove, setPatientToRemove] = useState(null);


  useEffect(() => {
    fetchMyPatients();
  }, []);

  // (consultStats supprimé)
  // Pour stocker les infos rendez-vous planifiés par patient
  const [rdvStats, setRdvStats] = useState({});

  // Récupérer les stats rendez-vous planifiés pour chaque patient
  useEffect(() => {
    if (!patients.length) return;
    const fetchStats = async () => {
      const rdvStatsTemp = {};
      for (const patient of patients) {
        try {
          // Vérifier que l'ID du patient est valide
          if (!patient.id) {
            console.warn('ID patient manquant', patient);
            continue; // Passer au patient suivant
          }
          
          const rdvs = await getAppointmentsByUser(patient.id);
          const now = new Date();
          // On ne garde que les rendez-vous planifiés et à venir
          const rdvsFuturs = rdvs.filter(rdv => rdv.statut === 'planifie' && new Date(rdv.date_rendezvous + 'T' + rdv.heure_debut) > now);
          const nextRdv = rdvsFuturs.length > 0 ? rdvsFuturs.reduce((a, b) => new Date(a.date_rendezvous + 'T' + a.heure_debut) < new Date(b.date_rendezvous + 'T' + b.heure_debut) ? a : b) : null;
          rdvStatsTemp[patient.id] = {
            count: rdvsFuturs.length,
            next: nextRdv ? (nextRdv.date_rendezvous + 'T' + nextRdv.heure_debut) : null
          };
        } catch (e) {
          rdvStatsTemp[patient.id] = { count: 0, next: null };
        }
      }
      setRdvStats(rdvStatsTemp);
    };
    fetchStats();
  }, [patients]);

  const fetchMyPatients = async () => {
    try {
      setLoading(true);
      
      // Utiliser le service traitant pour récupérer les vrais patients
      const patientsData = await traitantService.getMyPatients();
      setPatients(patientsData);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des patients:', err);
      setError('Erreur lors du chargement des patients');
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    `${patient.prenom || ''} ${patient.nom || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleRemovePatient = (patient) => {
    setPatientToRemove(patient);
    setShowRemoveModal(true);
  };

const confirmRemovePatient = async () => {
  if (!patientToRemove || !patientToRemove.id) {
    console.error('❌ patientToRemove est invalide :', patientToRemove);
    return;
  }

  try {
    await traitantService.removePatientRelation(patientToRemove.id);
    await fetchMyPatients(); // 🔄 Recharge la liste
    setShowRemoveModal(false);
    setPatientToRemove(null);
  } catch (error) {
    console.error('Erreur suppression relation patient :', error);
    setError('Erreur lors de la suppression du patient.');
  }
};


  const calculateAge = (dateNaissance) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="my-patients-loading">
        <div className="loading-spinner"></div>
        <h2>Chargement de vos patients...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-patients-error">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={fetchMyPatients} className="btn-retry">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-patients-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <span className="header-icon"><FaUsers size={22} /></span>
            <h1>Mes Patients</h1>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{patients.length}</span>
              <span className="stat-label">Patients Total</span>
            </div>
            <div className="stat-item recent">
              <span className="stat-number">
                {patients.filter(p => {
                  const lastConsult = new Date(p.derniere_consultation);
                  const oneWeekAgo = new Date();
                  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                  return lastConsult >= oneWeekAgo;
                }).length}
              </span>
              <span className="stat-label">Cette Semaine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="patients-content">
        {/* Barre de recherche */}
        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon"><FaSearch size={16} /></span>
            <input
              type="text"
              placeholder="Rechercher un patient (nom, prénom, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="search-clear"
                aria-label="Effacer la recherche"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Liste des patients */}
        {filteredPatients.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"><FaUser size={32} /></span>
          <span className="error-icon"><FaExclamationTriangle color="#e67e22" size={20} /></span>
            <h3>
              {searchTerm ? 'Aucun patient trouvé' : 'Aucun patient'}
            </h3>
            <p>
              {searchTerm 
                ? 'Essayez avec d\'autres termes de recherche'
                : 'Vous n\'avez pas encore de patients dans votre liste'
              }
            </p>
          </div>
        ) : (
          <div className="patients-grid">
            {filteredPatients.map(patient => (
              <div key={patient.id} className="patient-card">
                <div className="patient-header">
                  <div className="patient-identity">
                    <div className="patient-avatar">
                      {patient.photo_profil ? (
                        <img src={patient.photo_profil} alt="Profil" className="avatar-img" />
                      ) : (
                        <span>{(patient.prenom || 'P').charAt(0)}{(patient.nom || 'N').charAt(0)}</span>
                      )}
                    </div>
                    <div className="patient-info">
                      <h3>{patient.prenom || 'Prénom'} {patient.nom || 'Nom'}</h3>
                      <div className="patient-meta">
                        <span>{calculateAge(patient.date_naissance)} ans</span>
                        <span>•</span><span>{patient.sexe === 'M' ? 'Homme' : 'Femme'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="patient-status">
                    {patient.profil_complet && (
                      <span className="status-badge complete" title="Profil complet">
                        <FaCheckCircle color="#2ecc40" />
                      </span>
                    )}
                    {patient.urgence_accessible && (
                      <span className="status-badge emergency" title="Accès urgence">
                        <FaExclamationTriangle color="#e67e22" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="patient-body">
                  <div className="patient-contact">
                    <div className="contact-item">
                      <span className="contact-icon"><FaEnvelope size={15} /></span>
                      <span className="contact-value">{patient.email || 'Email non renseigné'}</span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon"><FaPhone size={15} /></span>
                      <span className="contact-value">{patient.telephone || 'Téléphone non renseigné'}</span>
                    </div>
                  </div>
                  <div className="patient-medical">
                    {patient.pathologies && patient.pathologies.length > 0 && (
                      <div className="medical-item">
                        <span className="medical-label">Pathologies :</span>
                        <div className="pathologies-list">
                          {patient.pathologies.map((patho, index) => (
                            <span key={index} className="pathology-tag">
                              {patho}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {patient.notes_medecin && (
                    <div className="patient-notes">
                      <span className="notes-icon"><FaNotesMedical size={15} /></span>
                      <p>{patient.notes_medecin}</p>
                    </div>
                  )}
                </div>

                <div className="patient-actions">
                  <button
                    onClick={() => handleViewPatient(patient)}
                    className="btn-view-patient"
                  >
                    <FaEye style={{marginRight:4}} />
                    Profil
                  </button>
                  <button
                    onClick={() => navigate(`/carnet-sante/${patient.id}`)}
                    className="btn-carnet-sante"
                  >
                    <FaBookMedical style={{marginRight:4}} />
                    Carnet de santé
                  </button>
                  <button
                    onClick={() => handleRemovePatient(patient)}
                    className="btn-remove-patient"
                  >
                    <FaTrashAlt style={{marginRight:4}} />
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détail patient */}
      {showPatientModal && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowPatientModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Profil de {selectedPatient.prenom} {selectedPatient.nom}
              </h3>
              <button
                onClick={() => setShowPatientModal(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="patient-detail-header">
                <div className="detail-avatar">
                  {selectedPatient.photo_profil ? (
                    <img src={selectedPatient.photo_profil} alt="Profil" className="avatar-img" />
                  ) : (
                    <span>{selectedPatient.prenom.charAt(0)}{selectedPatient.nom.charAt(0)}</span>
                  )}
                </div>
                <div className="detail-info">
                  <h2>{selectedPatient.prenom} {selectedPatient.nom}</h2>
                  <div className="detail-meta">
                    <span>{calculateAge(selectedPatient.date_naissance)} ans</span>
                    <span>•</span>
                    <span>Patient depuis le {formatDate(selectedPatient.date_ajout)}</span>
                  </div>
                </div>
              </div>

              <div className="patient-detail-sections">
                <div className="detail-section">
                  <h4>Informations de contact</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Email :</span>
                      <span className="detail-value">{selectedPatient.email || 'Non renseigné'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Téléphone :</span>
                      <span className="detail-value">{selectedPatient.telephone || 'Non renseigné'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date de naissance :</span>
                      <span className="detail-value">
                        {selectedPatient.date_naissance ? formatDate(selectedPatient.date_naissance) : 'Non renseigné'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Suivi médical</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Rendez-vous planifiés :</span>
                      <span className="detail-value">{rdvStats[selectedPatient.id]?.count ?? 0}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Prochain rendez-vous :</span>
                      <span className="detail-value">{rdvStats[selectedPatient.id]?.next ? formatDate(rdvStats[selectedPatient.id].next) : 'Aucun'}</span>
                    </div>
                  </div>
                </div>

                {selectedPatient.pathologies && selectedPatient.pathologies.length > 0 && (
                  <div className="detail-section">
                    <h4>Pathologies</h4>
                    <div className="pathologies-detail">
                      {selectedPatient.pathologies.map((patho, index) => (
                        <span key={index} className="pathology-detail-tag">
                          {patho}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPatient.notes_medecin && (
                  <div className="detail-section">
                    <h4>Notes médicales</h4>
                    <div className="notes-detail">
                      <p>{selectedPatient.notes_medecin}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => navigate(`/patients/${selectedPatient.id}/profile`)}
                className="btn-full-profile"
              >
                Voir le profil complet
              </button>
              <button
                onClick={() => setShowPatientModal(false)}
                className="btn-close"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showRemoveModal && patientToRemove && (
        <div className="modal-overlay" onClick={() => setShowRemoveModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Retirer le patient</h3>
              <button
                onClick={() => setShowRemoveModal(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="remove-confirmation">
                <div className="warning-icon">⚠️</div>
                    <div className="warning-icon"><FaExclamationTriangle color="#e67e22" size={24} /></div>
                    <FaTimes size={16} />
                <p>
                  Êtes-vous sûr de vouloir retirer{' '}
                  <strong>{patientToRemove?.prenom || ''} {patientToRemove?.nom || ''}</strong>{' '}
                  de votre liste de patients ?
                </p>
                <div className="warning-note">
                  <strong>Note :</strong> Cette action ne supprimera pas le compte du patient,
                  mais retirera seulement la relation médecin-patient.
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="btn-cancel"
              >
                Annuler
              </button>
              <button
                onClick={confirmRemovePatient}
                className="btn-confirm-remove"
              >
                Retirer 
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPatientsPage;
