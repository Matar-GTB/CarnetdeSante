// src/pages/rappels/CreateRappelPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateRappelPage.css';
import { creerRappelApi } from '../../services/rappelService';

const TYPES_RAPPELS = [
  { value: 'medication', label: 'Prise de médicament' },
  { value: 'appointment', label: 'Rendez-vous médical' },
  { value: 'custom', label: 'Autre' }
];
const RECURRENCES = [
  { value: 'aucune', label: 'Unique' },
  { value: 'quotidien', label: 'Quotidien' },
  { value: 'hebdomadaire', label: 'Hebdomadaire' },
  { value: 'mensuel', label: 'Mensuel' },
  { value: 'personnalise', label: 'Personnalisé' }
];

export default function CreateRappelPage() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState(1);
  const [typeRappel, setTypeRappel] = useState('medication');
  const [details, setDetails] = useState({});
  const [recurrence, setRecurrence] = useState('aucune');
  const [canaux, setCanaux] = useState({ email: true, sms: false, push: true });
  const [message, setMessage] = useState('');

  const suivant = () => setEtape(n => Math.min(5, n + 1));
  const precedent = () => setEtape(n => Math.max(1, n - 1));

  const handleSave = async () => {
    try {
      await creerRappelApi({ type_rappel: typeRappel, details, recurrence, canaux });
      setMessage('✅ Rappel créé avec succès');
      setTimeout(() => navigate('/rappels'), 1000);
    } catch  (err) { console.error('Erreur API /rappels :', err.response?.status, err.response?.data || err.message );
     setMessage(`❌ Erreur ${err.response?.status}: ${err.response?.data?.error || err.message}`);
    
    }
  };

  return (
    <div className="create-rappel-page">
      <h1>Nouveau rappel programmé</h1>
      {message && <p className={message.startsWith('✅') ? 'success' : 'error'}>{message}</p>}

      <div className="card">
        {etape === 1 && (
          <div className="step">
            <h2>1. Choisir le type de rappel</h2>
            <select value={typeRappel} onChange={e => setTypeRappel(e.target.value)}>
              {TYPES_RAPPELS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        )}

        {etape === 2 && (
          <div className="step">
            <h2>2. Détails du rappel</h2>
            {typeRappel === 'medication' && (
              <>
                <label>
                  Médicament<br />
                  <input
                    type="text"
                    placeholder="Ex: Paracétamol"
                    value={details.name || ''}
                    onChange={e => setDetails({ ...details, name: e.target.value })}
                  />
                </label>
                <label>
                  Dosage<br />
                  <input
                    type="text"
                    placeholder="1 comprimé"
                    value={details.dose || ''}
                    onChange={e => setDetails({ ...details, dose: e.target.value })}
                  />
                </label>
                <label>
                  Heure de prise<br />
                  <input
                    type="time"
                    value={details.time || ''}
                    onChange={e => setDetails({ ...details, time: e.target.value })}
                  />
                </label>
              </>
            )}
            {typeRappel === 'appointment' && (
              <>
                <label>
                  Date & heure du RDV<br />
                  <input
                    type="datetime-local"
                    value={details.datetime || ''}
                    onChange={e => setDetails({ ...details, datetime: e.target.value })}
                  />
                </label>
                <label>
                  Lieu (optionnel)<br />
                  <input
                    type="text"
                    placeholder="Lieu"
                    value={details.location || ''}
                    onChange={e => setDetails({ ...details, location: e.target.value })}
                  />
                </label>
              </>
            )}
           
            {typeRappel === 'custom' && (
              <>
                <label>
                  Titre<br />
                  <input
                    type="text"
                    placeholder="Titre du rappel"
                    value={details.title || ''}
                    onChange={e => setDetails({ ...details, title: e.target.value })}
                  />
                </label>
                <label>
                  Description<br />
                  <input
                    type="text"
                    placeholder="Description"
                    value={details.desc || ''}
                    onChange={e => setDetails({ ...details, desc: e.target.value })}
                  />
                </label>
                <label>
                  Date & heure<br />
                  <input
                    type="datetime-local"
                    value={details.datetime || ''}
                    onChange={e => setDetails({ ...details, datetime: e.target.value })}
                  />
                </label>
              </>
            )}
          </div>
        )}

        {etape === 3 && (
          <div className="step">
            <h2>3. Récurrence</h2>
            <select value={recurrence} onChange={e => setRecurrence(e.target.value)}>
              {RECURRENCES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        )}

        {etape === 4 && (
          <div className="step">
            <h2>4. Canaux de notification</h2>
            <label>
              <input
                type="checkbox"
                checked={canaux.email}
                onChange={e => setCanaux({ ...canaux, email: e.target.checked })}
              />
              Email
            </label>
            <label>
              <input
                type="checkbox"
                checked={canaux.sms}
                onChange={e => setCanaux({ ...canaux, sms: e.target.checked })}
              />
              SMS
            </label>
            <label>
              <input
                type="checkbox"
                checked={canaux.push}
                onChange={e => setCanaux({ ...canaux, push: e.target.checked })}
              />
              Push
            </label>
          </div>
        )}

        {etape === 5 && (
  <div className="step">
    <h2>5. Récapitulatif</h2>
    <ul>
      <li><strong>Type :</strong> {TYPES_RAPPELS.find(t => t.value === typeRappel)?.label}</li>
      <li><strong>Détails :</strong>
        <ul>
          {Object.entries(details).map(([key, value]) => (
            <li key={key}>{key}: {value}</li>
          ))}
        </ul>
      </li>
      <li><strong>Récurrence :</strong> {RECURRENCES.find(r => r.value === recurrence)?.label}</li>
      <li><strong>Notifications :</strong> {Object.entries(canaux).filter(([_, val]) => val).map(([canal]) => canal).join(', ')}</li>
    </ul>
  </div>
)}


        <div className="actions">
          <button onClick={precedent} disabled={etape === 1}>Précédent</button>
          {etape < 5 ? (
            <button onClick={suivant}>Suivant</button>
          ) : (
            <button onClick={handleSave}>Enregistrer</button>
            
          )}
           <button className="cancel" onClick={() => navigate('/rappels')}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

