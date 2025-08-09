// pages/medecin/PlanningPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointmentsByUser } from '../../services/appointmentService';
import traitantService from '../../services/traitantService';
import { AuthContext } from '../../contexts/AuthContext';
import './PlanningPage.css';

const PlanningPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('today'); // 'today', 'upcoming', 'history'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientsTraitants, setPatientsTraitants] = useState([]); // ids des patients dont je suis traitant

  useEffect(() => {
    if (!user || !user.id) {
      setError('Utilisateur non connecté ou ID manquant');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    getAppointmentsByUser(user.id)
      .then((data) => {
        setAppointments((data || []).filter(rdv => rdv.statut === 'planifie'));
        setLoading(false);
      })
      .catch((err) => {
        setError('Erreur lors du chargement des rendez-vous');
        setLoading(false);
      });
    // Charger la liste des patients dont je suis traitant
    traitantService.getMyPatients()
      .then((patients) => {
        setPatientsTraitants(patients.map(p => String(p.id)));
      })
      .catch(() => {
        setPatientsTraitants([]);
      });
  }, [user]);

  if (loading) return <div>Chargement du planning...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  // Fonction pour formater la date en "jour semaine jour mois" (ex: vendredi 30 juillet)
  const formatJourSemaineJourMois = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
  };

  // Filtrage selon l'onglet
  const today = new Date();
  today.setHours(0,0,0,0);
  const filterAppointments = () => {
    if (tab === 'today') {
      return appointments.filter(rdv => {
        const d = new Date(rdv.date_rendezvous || rdv.date);
        d.setHours(0,0,0,0);
        return d.getTime() === today.getTime();
      });
    } else if (tab === 'upcoming') {
      return appointments.filter(rdv => {
        const d = new Date(rdv.date_rendezvous || rdv.date);
        d.setHours(0,0,0,0);
        return d.getTime() > today.getTime();
      });
    } else if (tab === 'history') {
      return appointments.filter(rdv => {
        const d = new Date(rdv.date_rendezvous || rdv.date);
        d.setHours(0,0,0,0);
        return d.getTime() < today.getTime();
      });
    }
    return appointments;
  };
  const filteredAppointments = filterAppointments();

  return (
    <div className="planning-page">
      <h1>Mon planning</h1>
      <div style={{display:'flex', gap:12, marginBottom:24, justifyContent:'center'}}>
        <button onClick={() => setTab('today')} style={{fontWeight: tab==='today' ? 'bold' : 400, borderBottom: tab==='today' ? '2px solid #1a3557' : 'none', background:'none', color:'#1a3557', fontSize:'1rem', cursor:'pointer'}}>Aujourd'hui</button>
        <button onClick={() => setTab('upcoming')} style={{fontWeight: tab==='upcoming' ? 'bold' : 400, borderBottom: tab==='upcoming' ? '2px solid #1a3557' : 'none', background:'none', color:'#1a3557', fontSize:'1rem', cursor:'pointer'}}>À venir</button>
        <button onClick={() => setTab('history')} style={{fontWeight: tab==='history' ? 'bold' : 400, borderBottom: tab==='history' ? '2px solid #1a3557' : 'none', background:'none', color:'#1a3557', fontSize:'1rem', cursor:'pointer'}}>Historique</button>
      </div>
      {filteredAppointments.length === 0 ? (
        <p style={{textAlign:'center', color:'#888'}}>Aucun rendez-vous à afficher.</p>
      ) : (
        <ul>
          {filteredAppointments.map((rdv) => (
            <li key={rdv.id}>
              <div>
                <strong>{formatJourSemaineJourMois(rdv.date_rendezvous || rdv.date)} à {rdv.heure_debut || rdv.heure}</strong> — {rdv.Patient?.prenom ? `${rdv.Patient.prenom} ${rdv.Patient.nom}` : rdv.patientNom || rdv.patient_id}
                {rdv.Patient && patientsTraitants.includes(String(rdv.Patient.id)) && (
                  <span style={{
                    background:'#00b894',
                    color:'white',
                    borderRadius:'8px',
                    padding:'2px 10px',
                    marginLeft:10,
                    fontSize:'0.9em',
                    fontWeight:700,
                    letterSpacing:'0.5px',
                    boxShadow:'0 1px 4px rgba(0,0,0,0.08)'
                  }}>Traitant</span>
                )}
                <button onClick={() => navigate(`/profile/patient/${rdv.Patient?.id || rdv.patientId || rdv.patient_id}`)}>
                  Voir profil public
                </button>
                {tab === 'today' && (
                  <button onClick={() => navigate(`/consultation/${rdv.id}`)}>
                    Fiche consultation
                  </button>
                )}
                <button onClick={() => navigate(`/carnet-sante/${rdv.Patient?.id || rdv.patientId || rdv.patient_id}`)}>
                  Carnet de santé
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlanningPage;
