// src/pages/consultations/ConsultationsPage.jsx
import React, { useEffect, useState } from 'react';
import {
  getAppointmentsByUser,
  acceptAppointment,
  deleteAppointment,
  createAppointment,
  refuseAppointment,
  cancelAppointment
} from '../../services/appointmentService';
import { getTokenPayload } from '../../utils/tokenUtils';
import './ConsultationsPage.css';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import DisponibiliteSection from '../../components/profile/sections/DisponibiliteSection';

export default function ConsultationsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [tab, setTab]                   = useState('pending');
  const [blockDate, setBlockDate]       = useState('');
  const [blockStart, setBlockStart]     = useState('');
  const [blockEnd, setBlockEnd]         = useState('');
  const navigate = useNavigate();
  const [traitantPatientsIds, setTraitantPatientsIds] = useState([]);
  const [search, setSearch] = useState('');
  const { user, role } = useContext(AuthContext);
  const userId = user?.id;

useEffect(() => {
  // Charge la liste des patients traitants si utilisateur = médecin
  const fetchTraitantPatients = async () => {
    if (role === 'medecin') {
      try {
        const res = await fetch('/api/traitants/patients', {
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          setTraitantPatientsIds(data.data.map(p => p.id));
        }
      } catch (e) {
        setTraitantPatientsIds([]);
      }
    }
  };
  fetchTraitantPatients();
}, [role]);

  useEffect(() => {
  if (!userId) return;
  
  const loadConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier que l'ID utilisateur est défini
      if (!userId) {
        setError('Utilisateur non connecté. Veuillez vous connecter pour voir vos consultations.');
        setAppointments([]);
        return;
      }
      
      // Utiliser le bon service selon le rôle
      const data = await getAppointmentsByUser(userId);
      
      setAppointments(data || []);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  loadConsultations();
}, [userId, user.role]);

useEffect(() => {
  const loadData = async () => {
    try {
      // Vérifier que l'ID utilisateur est défini
      if (!userId) {
        setError('Utilisateur non connecté. Veuillez vous connecter pour voir vos consultations.');
        setAppointments([]);
        return;
      }
      
      const data = await getAppointmentsByUser(userId);
      
      // Filtrer pour ne garder que les consultations (où l'utilisateur est médecin)
      const consultations = data.filter(apt => 
        apt.medecin_id === userId && 
        apt.type_rendezvous !== 'indisponibilite'
      );
      
      setAppointments(consultations);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  loadData();
}, [userId]);

function filterWithSearch(list) {
  if (!search.trim()) return list;
  const s = search.toLowerCase();
  return list.filter(a =>
    (a.Patient?.prenom?.toLowerCase().includes(s) || '') ||
    (a.Patient?.nom?.toLowerCase().includes(s) || '') ||
    (a.type_rendezvous?.toLowerCase().includes(s) || '') ||
    (a.Medecin?.prenom?.toLowerCase().includes(s) || '') ||
    (a.Medecin?.nom?.toLowerCase().includes(s) || '')
  );
}

  // Séparation des RDV par statut et date
  const pendingAll = appointments.filter(a => a.statut === 'en_attente');
  const confirmedAll = appointments.filter(
    a => a.statut === 'planifie' && a.type_rendezvous !== 'indisponibilite'
  );
  const blocked = appointments.filter(a => a.type_rendezvous === 'indisponibilite');

  // date du jour en YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // futurs vs passés
  const upcoming = confirmedAll.filter(a => a.date_rendezvous >= today);
  const history  = appointments.filter(
  a => (a.statut === 'planifie' || a.statut === 'refuse') && a.date_rendezvous < today
);


  // handlers (identiques à avant)
  const handleAccept = async id => {
    await acceptAppointment(id);
    setAppointments(a =>
      a.map(x => (x.id === id ? { ...x, statut: 'planifie' } : x))
    );
  };
  const handleCancel = async id => {
  const motif = prompt("Motif d'annulation (optionnel) :");
  if (motif === null) return; // Annulé par l'utilisateur
  await cancelAppointment(id, motif);
  setAppointments(a =>
    a.map(x => (x.id === id ? { ...x, statut: 'annule', notes: motif } : x))
  );
};

  const handleRefuse = async id => {
  if (!window.confirm('Refuser cette demande ?')) return;
  await refuseAppointment(id);
  setAppointments(a =>
    a.map(x => (x.id === id ? { ...x, statut: 'refuse' } : x))
  );
};
  const handleBlock = async e => {
    e.preventDefault();
    if (!blockDate || !blockStart || !blockEnd) return alert('Remplis tous les champs');
    const newBlk = await createAppointment({
      patient_id:      userId,
      medecin_id:      userId,
      date_rendezvous: blockDate,
      heure_debut:     blockStart,
      heure_fin:       blockEnd,
      type_rendezvous: 'indisponibilite',
      notes:           ''
    });
    setAppointments(a => [...a, newBlk]);
    setBlockDate(''); setBlockStart(''); setBlockEnd('');
  };
  const handleUnblock = async id => {
    if (!window.confirm('Supprimer ce blocage ?')) return;
    await deleteAppointment(id);
    setAppointments(a => a.filter(x => x.id !== id));
  };

  if (loading) {
    return (
      <div className="consultations-page">
        {/* Garde le header même pendant le chargement */}
        <div className="consultation-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <span>←</span>
            <span>Retour</span>
          </button>

          <div className="header-content">
            <div className="header-icon">
              <FaCalendarAlt />
            </div>
            <div className="header-text">
              <h1>Mes consultations</h1>
              <p>Gérez vos rendez-vous médicaux</p>
            </div>
          </div>
        </div>

        <div className="loader">
          <div className="loader-spinner"></div>
          <p className="loader-text">Chargement de vos consultations...</p>
        </div>
      </div>
    );
  }

  if (error)   return <div className="error">{error}</div>;

  return (
    <div className="consultations-page">
      {/* Nouveau header moderne */}
      <div className="consultation-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <span>←</span>
          <span>Retour</span>
        </button>

        <div className="header-content">
          <div className="header-icon">
            <FaCalendarAlt />
          </div>
          <div className="header-text">
            <h1>Mes consultations</h1>
            <p>Gérez vos rendez-vous médicaux</p>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="consult-search-bar">
      <input
        type="text"
        placeholder="Rechercher un patient, type de RDV..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>
      

      {/* Onglets */}
      <div className="tabs">
        <button
          className={tab==='pending'   ? 'active' : ''}
          onClick={()=>setTab('pending')}
        >
          Demandes ({pendingAll.length})
        </button>
        <button
          className={tab==='upcoming'  ? 'active' : ''}
          onClick={()=>setTab('upcoming')}
        >
          À venir ({upcoming.length})
        </button>
        <button
          className={tab==='history'   ? 'active' : ''}
          onClick={()=>setTab('history')}
        >
          Historique ({history.length})
        </button>
        <button
          className={tab==='disponib'   ? 'active' : ''}
          onClick={()=>setTab('disponib')}
        >
          Disponib
        </button>
      </div>

      {/* Contenu de chaque onglet */}
      {tab === 'pending' && (
        <div className="grid">
          {filterWithSearch(pendingAll).map(a => (
            <div key={a.id} className="card pending">
              <div className="card-header">
                <FaLock className="icon pending"/>
                <div>
                  {a.Patient.prenom} {a.Patient.nom}
          {/* Badge vert pour patient traitant */}
          {role === 'medecin' && traitantPatientsIds.includes(a.Patient.id) && (
            <span className="badge-traitant">Traitant</span>
          )}
                  <small>{a.date_rendezvous} • {a.heure_debut}</small>
                </div>
              </div>
              <p>{a.type_rendezvous}</p>
              {a.notes && <p className="notes">{a.notes}</p>}
              <div className="card-actions">
                <button onClick={()=>handleAccept(a.id)}>
                  <FaCheckCircle/> Accepter
                </button>
                <button onClick={()=>handleRefuse(a.id)}>
                  <FaTimesCircle/> Refuser
                </button>
              </div>
            </div>
          ))}
          {!pendingAll.length && <p>Aucune demande en attente.</p>}
        </div>
      )}
            {tab === 'upcoming' && (
              <div className="timeline">
                {filterWithSearch(upcoming).map(a => (
                  <div key={a.id} className="timeline-item">
                    <span className="dot confirmed"><FaCheckCircle/></span>
                    <div className="content">
                      <strong>
                          {a.Patient.prenom} {a.Patient.nom}
                          {role === 'medecin' && traitantPatientsIds.includes(a.Patient.id) && (
                            <span className="badge-traitant">Traitant</span>
                          )}
                        </strong>
                      <small>{a.date_rendezvous} • {a.heure_debut}</small>
                      <p>{a.type_rendezvous}</p>
                      {/* ➕ Ajout du bouton Annuler pour le patient OU le médecin */}
                      {(userId === a.Patient.id || userId === a.Medecin.id) && (
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancel(a.id)}
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {!upcoming.length && <p>Aucun RDV à venir.</p>}
              </div>
            )}
          {tab === 'history' && (
            <div className="timeline">
              {filterWithSearch(history).map(a => (
                <div key={a.id} className={`timeline-item ${a.statut === 'annule' ? 'cancelled' : ''}`}>
                  <span className={`dot ${a.statut === 'annule' ? 'cancelled' : (a.statut === 'refuse' ? 'refused' : 'history')}`}>
                    {a.statut === 'annule'
                      ? <FaTimesCircle/>
                      : a.statut === 'refuse'
                        ? <FaTimesCircle/>
                        : <FaCheckCircle/>
                    }
                  </span>
                  <div className="content">
                    <strong>
                      {a.Patient.prenom} {a.Patient.nom}
                      {role === 'medecin' && traitantPatientsIds.includes(a.Patient.id) && (
                        <span className="badge-traitant">Traitant</span>
                      )}
                    </strong>
                    <small>{a.date_rendezvous} • {a.heure_debut}</small>
                    <p>
                      {a.type_rendezvous}
                      {a.statut === 'annule' && <span className="cancelled-badge">Annulé</span>}
                      {a.statut === 'refuse' && <span className="refused-badge">Refusé</span>}
                    </p>
                    {a.statut === 'annule' && a.notes && (
                      <div className="cancel-reason">Motif : {a.notes}</div>
                    )}
                  </div>
                </div>
              ))}
              {!history.length && <p>Aucune consultation passée.</p>}
            </div>
          )}
      {tab === 'disponib' && (
        <div className="disponib-section">
          <DisponibiliteSection editMode={true} />
        </div>
      )}
    </div>
  );
}
