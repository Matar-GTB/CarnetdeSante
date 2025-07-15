// src/pages/medecinTraitant/RequestTraitantPage.jsx
import React, { useEffect, useState } from 'react';
import {
  getAllMedecins,
  requestTraitant,
  getMyTraitantRequests
} from '../../services/traitantService';
import './RequestTraitantPage.css';

export default function RequestTraitantPage() {
  const [medecins, setMedecins]   = useState([]);
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [messages, setMessages]   = useState({ success: '', error: '' });
  const [submittingId, setSubmitting] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [docs, reqs] = await Promise.all([
          getAllMedecins(),
          getMyTraitantRequests()
        ]);
        setMedecins(docs);
        setRequests(reqs);
      } catch {
        setMessages({ success: '', error: 'Impossible de charger les données.' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRequest = async medecin => {
    setSubmitting(medecin.id);
    setMessages({ success: '', error: '' });
    try {
      await requestTraitant({ medecin_id: medecin.id, message: medecin.message || '' });
      const updated = await getMyTraitantRequests();
      setRequests(updated);
      setMessages({ success: `Demande envoyée à Dr ${medecin.nom}`, error: '' });
    } catch {
      setMessages({ success: '', error: 'Échec de la demande.' });
    } finally {
      setSubmitting(null);
    }
  };

  // filtrage sans debounce
  const filtered = medecins.filter(m => {
    const q = search.toLowerCase();
    return (
      `${m.prenom} ${m.nom}`.toLowerCase().includes(q) ||
      (m.specialite || '').toLowerCase().includes(q) ||
      (m.etablissements || '').toLowerCase().includes(q)
    );
  });

  if (loading) return <p className="loader">Chargement…</p>;

  return (
    <div className="request-traitant-page">
      <h1>Mes demandes de médecin traitant</h1>

      {messages.success && <div className="notification success">{messages.success}</div>}
      {messages.error   && <div className="notification error">{messages.error}</div>}

      <section className="my-requests">
        <h2>État de mes demandes</h2>
        {requests.length === 0
          ? <p className="empty">Vous n’avez pas encore fait de demande.</p>
          : (
            <ul>
              {requests.map(r => (
                <li key={r.id} className={`status ${r.statut}`}>
                  <strong>{r.Medecin.prenom} {r.Medecin.nom}</strong>
                  <span>— {r.statut.replace('_', ' ')}</span>
                </li>
              ))}
            </ul>
          )
        }
      </section>

      <section className="search-section">
        <input
          type="text"
          placeholder="Rechercher (nom, spécialité, établissement)…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </section>

      <section className="medecins-list">
        {filtered.length === 0
          ? <p className="empty">Aucun médecin ne correspond à votre recherche.</p>
          : filtered.map(m => {
            const already = requests.find(r => r.medecin_id === m.id);
            return (
              <div key={m.id} className="med-card">
                <div className="med-info">
                  <h3>Dr {m.prenom} {m.nom}</h3>
                  <p className="spec">{m.specialite}</p>
                  <p className="etab">{m.etablissements}</p>
                </div>
                <button
                  className="btn-request"
                  disabled={!!already || submittingId === m.id}
                  onClick={() => handleRequest(m)}
                >
                  {already
                    ? already.statut === 'en_attente'
                      ? 'En attente…'
                      : already.statut === 'accepte'
                        ? 'Accepté ✅'
                        : 'Refusé ✖︎'
                    : (submittingId === m.id ? '…' : 'Demander')}
                </button>
              </div>
            );
          })
        }
      </section>
    </div>
  );
}
