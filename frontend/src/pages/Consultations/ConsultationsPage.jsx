// src/pages/consultations/ConsultationsPage.jsx
import React, { useEffect, useState } from 'react';
import {
  getAppointmentsByUser,
  acceptAppointment,
  deleteAppointment,
  createAppointment
} from '../../services/appointmentService';
import { getTokenPayload } from '../../utils/tokenUtils';
import './ConsultationsPage.css';
import { FaCheckCircle, FaTimesCircle, FaLock } from 'react-icons/fa';

export default function ConsultationsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [tab, setTab]                   = useState('pending');
  const [blockDate, setBlockDate]       = useState('');
  const [blockStart, setBlockStart]     = useState('');
  const [blockEnd, setBlockEnd]         = useState('');

  const userId = getTokenPayload(localStorage.getItem('token'))?.userId;

  useEffect(() => {
    (async () => {
      try {
        const data = await getAppointmentsByUser(userId);
        setAppointments(data);
      } catch {
        setError('Impossible de charger vos consultations.');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

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
  const history  = confirmedAll.filter(a => a.date_rendezvous <  today);

  // handlers (identiques à avant)
  const handleAccept = async id => {
    await acceptAppointment(id);
    setAppointments(a =>
      a.map(x => (x.id === id ? { ...x, statut: 'planifie' } : x))
    );
  };
  const handleRefuse = async id => {
    if (!window.confirm('Refuser cette demande ?')) return;
    await deleteAppointment(id);
    setAppointments(a => a.filter(x => x.id !== id));
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

  if (loading) return <div className="loader">Chargement…</div>;
  if (error)   return <div className="error">{error}</div>;

  return (
    <div className="consultations-page">
      <h1>Mes consultations</h1>

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
          className={tab==='blocked'   ? 'active' : ''}
          onClick={()=>setTab('blocked')}
        >
          Indispos ({blocked.length})
        </button>
      </div>

      {/* Contenu de chaque onglet */}
      {tab === 'pending' && (
        <div className="grid">
          {pendingAll.map(a => (
            <div key={a.id} className="card pending">
              <div className="card-header">
                <FaLock className="icon pending"/>
                <div>
                  <strong>{a.Patient.prenom} {a.Patient.nom}</strong>
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
          {upcoming.map(a => (
            <div key={a.id} className="timeline-item">
              <span className="dot confirmed"><FaCheckCircle/></span>
              <div className="content">
                <strong>{a.Patient.prenom} {a.Patient.nom}</strong>
                <small>{a.date_rendezvous} • {a.heure_debut}</small>
                <p>{a.type_rendezvous}</p>
              </div>
            </div>
          ))}
          {!upcoming.length && <p>Aucun RDV à venir.</p>}
        </div>
      )}

      {tab === 'history' && (
        <div className="timeline">
          {history.map(a => (
            <div key={a.id} className="timeline-item">
              <span className="dot history"><FaCheckCircle/></span>
              <div className="content">
                <strong>{a.Patient.prenom} {a.Patient.nom}</strong>
                <small>{a.date_rendezvous} • {a.heure_debut}</small>
                <p>{a.type_rendezvous}</p>
              </div>
            </div>
          ))}
          {!history.length && <p>Aucune consultation passée.</p>}
        </div>
      )}

      {tab === 'blocked' && (
        <div className="blocked-section">
          <form className="block-form" onSubmit={handleBlock}>
            <input type="date" value={blockDate} onChange={e=>setBlockDate(e.target.value)} required/>
            <input type="time" value={blockStart} onChange={e=>setBlockStart(e.target.value)} required/>
            <input type="time" value={blockEnd} onChange={e=>setBlockEnd(e.target.value)} required/>
            <button type="submit">Bloquer</button>
          </form>
          <ul className="blocked-list">
            {blocked.map(b => (
              <li key={b.id}>
                <FaLock className="icon block"/>
                <span>{b.date_rendezvous} • {b.heure_debut}-{b.heure_fin}</span>
                <button onClick={()=>handleUnblock(b.id)}>Annuler</button>
              </li>
            ))}
            {!blocked.length && <p>Aucune indisponibilité programmée.</p>}
          </ul>
        </div>
      )}
    </div>
  );
}
