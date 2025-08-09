// Page Carnet de Santé : liste toutes les consultations d'un patient
import React, { useEffect, useState, useContext } from 'react';
import './CarnetSante.css';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getConsultationsByPatient } from '../services/consultationService';
import { getAllMedecins } from '../services/traitantService';
import { exportCarnetSantePDF } from '../utils/pdfCarnetSante';
import { MdDownload, MdArrowBack } from 'react-icons/md';

const CarnetSante = () => {
  const { id: patientIdParam } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  // Si le patient consulte son propre carnet, on prend son id, sinon on prend l'id du paramètre
  const patientId = patientIdParam || user?.id;
  const [consultations, setConsultations] = useState([]);
  const [medecinNames, setMedecinNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    Promise.all([
      getConsultationsByPatient(patientId),
      getAllMedecins()
    ])
      .then(([consults, medecins]) => {
        const sorted = consults.sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation));
        setConsultations(sorted);
        // Associer les noms complets
        const namesObj = {};
        medecins.forEach(med => {
          if (med.id) namesObj[med.id] = med.prenom ? `${med.prenom} ${med.nom}` : med.nom || med.id;
        });
        setMedecinNames(namesObj);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement du carnet de santé');
        setLoading(false);
      });
  }, [patientId]);

  if (loading) return <div>Chargement du carnet de santé...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div className="carnet-sante-page">
      <div className="page-header">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
          title="Retour"
        >
          <MdArrowBack size={20} />
          <span>Retour</span>
        </button>
        <h1>Carnet de santé</h1>
      </div>
      {consultations.length > 0 && (
        <div style={{display:'flex', justifyContent:'flex-end', marginBottom:18}}>
          <button onClick={() => exportCarnetSantePDF(
            consultations.map(c => ({
              ...c,
              medecin_nom: medecinNames[c.medecin_id] || c.medecin_id
            })),
            user?.prenom ? `${user.prenom} ${user.nom}` : ''
          )}>
            Exporter tout le carnet en PDF
          </button>
        </div>
      )}
      {consultations.length === 0 ? (
        <p>Aucune consultation trouvée.</p>
      ) : (
        <ul>
          {consultations.map(consult => (
            <li key={consult.id}>
              <div>
                <strong>{consult.date_consultation ? new Date(consult.date_consultation).toLocaleString() : ''}</strong>
                <span> — Médecin : {medecinNames[consult.medecin_id] ? medecinNames[consult.medecin_id] : consult.medecin_id}</span>
                <button onClick={() => navigate(`/consultation/${consult.rendezvous_id}`)}>
                  Voir la fiche
                </button>
                <button
                  title="Exporter cette fiche en PDF"
                  style={{marginLeft:8, background:'none', border:'none', cursor:'pointer', padding:2, verticalAlign:'middle'}}
                  onClick={() => exportCarnetSantePDF([
                    {...consult, medecin_nom: medecinNames[consult.medecin_id] || consult.medecin_id}
                  ], user?.prenom ? `${user.prenom} ${user.nom}` : '')}
                >
                  <MdDownload size={22} color="#1a3557" />
                </button>
              </div>
              <div className="notes-preview">
                {consult.notes ? consult.notes.substring(0, 80) + (consult.notes.length > 80 ? '...' : '') : 'Pas de notes'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CarnetSante;
