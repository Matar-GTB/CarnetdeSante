// pages/medecin/ConsultationDetails.jsx
import React, { useContext, useEffect, useState } from 'react';
import './ConsultationDetails.css';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { getConsultationByRendezvous, updateConsultation, getConsultationsByPatient } from '../../services/consultationService';

const ConsultationDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ notes: '', examens: '', medicaments: '', notes_retenir: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;
    // Charger la consultation liée au rendez-vous
    getConsultationByRendezvous(id).then((data) => {
      setConsultation(data);
      setForm({
        notes: data?.notes || '',
        examens: data?.examens || '',
        medicaments: data?.medicaments || '',
        notes_retenir: data?.notes_retenir || ''
      });
      // Charger l'historique du patient
      if (data && data.patient_id) {
        getConsultationsByPatient(data.patient_id).then(hist => {
          setHistory(hist.filter(c => String(c.id) !== String(data.id)));
        });
      }
      setLoading(false);
    }).catch(() => {
      setError('Erreur lors du chargement de la consultation');
      setLoading(false);
    });
  }, [id, user]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      await updateConsultation(consultation.id, form);
      setSuccess('✅ Modifications enregistrées !');
    } catch (e) {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!consultation) return <div>Consultation introuvable.</div>;

  return (
    <div className="consultation-details">
      <h2>Fiche consultation</h2>
      <div><strong>Date :</strong> {consultation.date_consultation ? new Date(consultation.date_consultation).toLocaleString() : ''}</div>
      <div><strong>Patient :</strong> {consultation.patient_id}</div>
      <div>
        <label>Notes de consultation :</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} style={{width:'100%'}} />
      </div>
      <div>
        <label>Examens prescrits :</label>
        <input name="examens" type="text" value={form.examens} onChange={handleChange} style={{width:'100%'}} />
      </div>
      <div>
        <label>Médicaments :</label>
        <input name="medicaments" type="text" value={form.medicaments} onChange={handleChange} style={{width:'100%'}} />
      </div>
      <div>
        <label>Notes à retenir :</label>
        <textarea name="notes_retenir" value={form.notes_retenir} onChange={handleChange} rows={2} style={{width:'100%'}} />
      </div>
      <button onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
      {success && <div style={{color:'green'}}>{success}</div>}
      {/* Historique des consultations */}
      {history.length > 0 && (
        <div style={{marginTop:24}}>
          <h3>Historique du patient</h3>
          <ul>
            {history.map(h => (
              <li key={h.id}>
                {h.date_consultation ? new Date(h.date_consultation).toLocaleString() : ''} — {h.notes ? h.notes.substring(0, 40) + '...' : 'Pas de notes'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConsultationDetails;
