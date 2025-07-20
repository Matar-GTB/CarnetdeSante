import React, { useEffect, useState } from 'react';
import {
  getAllMedecins,
  requestTraitant,
  getMyTraitantRequests,
  getMyTraitants
} from '../../services/traitantService';
import './RequestTraitantPage.css';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../services/profileService';

export default function RequestTraitantPage() {
  const [tab, setTab] = useState(0);
  const [traitants, setTraitants] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState({ success: '', error: '' });
  const [submittingId, setSubmitting] = useState(null);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [docs, reqs, mesTraitants] = await Promise.all([
          getAllMedecins(),
          getMyTraitantRequests(),
          getMyTraitants()
        ]);
        setMedecins(docs.map(m => ({ ...m, message: '' })));
        setRequests(reqs);
        setTraitants(mesTraitants);
      } catch {
        setMessages({ success: '', error: 'Impossible de charger les données.' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = medecins.filter(m => {
    const q = search.toLowerCase();
    return (
      `${m.prenom} ${m.nom}`.toLowerCase().includes(q) ||
      (m.specialite || '').toLowerCase().includes(q) ||
      (m.etablissements || '').toLowerCase().includes(q)
    );
  });

  const handleMessageChange = (id, value) => {
    setMedecins(ms =>
      ms.map(m => m.id === id ? { ...m, message: value } : m)
    );
  };

  const handleRequest = async medecin => {
    setSubmitting(medecin.id);
    setMessages({ success: '', error: '' });
    try {
      await requestTraitant({ medecin_id: medecin.id, message: medecin.message || '' });
      const updated = await getMyTraitantRequests();
      setRequests(updated);
      setMessages({ success: `Demande envoyée à Dr ${medecin.prenom} ${medecin.nom}`, error: '' });
      setMedecins(ms => ms.map(m => m.id === medecin.id ? { ...m, message: '' } : m));
    } catch {
      setMessages({ success: '', error: 'Échec de la demande.' });
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <p className="loader">Chargement…</p>;

  return (
    <div className="request-traitant-page">
      <h1>👩‍⚕️ Médecin traitant</h1>

      {/* Onglets modernes */}
      <div className="traitant-tabs">
        <button className={tab === 0 ? "tab-active" : ""} onClick={() => setTab(0)}>
          <span role="img" aria-label="doctor">🩺</span> Mes médecins traitants
        </button>
        <button className={tab === 1 ? "tab-active" : ""} onClick={() => setTab(1)}>
          <span role="img" aria-label="search">🔍</span> Recherche & Demandes
        </button>
      </div>

      {/* SECTION 1 : Mes médecins traitants */}
      {tab === 0 && (
        <section className="my-traitants">
          {traitants.length === 0
            ? <p className="empty">Aucun médecin traitant pour l’instant.</p>
            : (
              <div className="medecins-list">
                {traitants.map(m => {
                  console.log('medecin complet', m);
                  console.log('photo_profil (traitant)', m.photo_profil); // LOG TRAITANT
                  return (
                    <div
                      key={m.id}
                      className="med-card"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/doctors/${m.id}/public`)}
                      tabIndex={0}
                      onKeyPress={e => { if (e.key === "Enter") navigate(`/doctors/${m.id}/public`); }}
                    >
                      <div className="med-info">
                      <img
                      src={
                        m.photo_profil && m.photo_profil.startsWith('/uploads')
                          ? `${API_BASE_URL}${m.photo_profil}`
                          : m.photo_profil && m.photo_profil.startsWith('http')
                            ? m.photo_profil
                            : "/default-avatar.png"
                      }
                      alt=""
                      className="dropdown-photo"
                    />

                        <div>
                          <h3
                            className="doctor-link"
                            style={{ color: "#2e79bc", textDecoration: "underline", cursor: "pointer", margin: 0 }}
                          >
                            Dr {m.prenom} {m.nom}
                          </h3>
                          <p className="spec">{m.specialite}</p>
                          <p className="etab">{m.etablissements}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </section>
      )}

      {/* SECTION 2 : Recherche & demandes */}
      {tab === 1 && (
        <>
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
                      <strong>Dr {r.Medecin.prenom} {r.Medecin.nom}</strong>
                      <span className="statut">{r.statut.replace('_', ' ')}</span>
                    </li>
                  ))}
                </ul>
              )
            }
          </section>

          <section className="search-section">
            <input
              type="text"
              placeholder="🔎 Rechercher (nom, spécialité, établissement)…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {search.length > 0 && filtered.length > 0 && showDropdown && (
              <ul className="autocomplete-dropdown">
                {filtered.map(m => {
                   console.log('medecin complet', m);
                  console.log('photo_profil (dropdown)', m.photo_profil); // LOG DROPDOWN
                  return (
                    <li
                      key={m.id}
                      className="dropdown-item"
                      onMouseDown={() => navigate(`/doctors/${m.id}/public`)}
                      tabIndex={0}
                    >
                      <img
                        src={
                          m.photo_profil && m.photo_profil.startsWith('/uploads')
                            ? `${API_BASE_URL}${m.photo_profil}`
                            : m.photo_profil && m.photo_profil.startsWith('http')
                              ? m.photo_profil
                              : "/default-avatar.png"
                        }
                        alt=""
                        className="dropdown-photo"
                      />

                      <div className="dropdown-info">
                        <strong>
                          {m.traitant ? "👑 " : ""}
                          Dr {m.prenom} {m.nom}
                        </strong>
                        <div className="dropdown-specialite">{m.specialite}</div>
                        <div className="dropdown-etab">{m.etablissements}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="medecins-list">
            {filtered.length === 0
              ? <p className="empty">Aucun médecin ne correspond à votre recherche.</p>
              : filtered.map(m => {
                  // Tu peux logger ici aussi si besoin
                  return (
                    <div key={m.id} className="med-card">
                      <div className="med-info">
                        <h3>Dr {m.prenom} {m.nom}</h3>
                        <p className="spec">{m.specialite}</p>
                        <p className="etab">{m.etablissements}</p>
                      </div>
                      <label className="message-label">
                        Message <span className="optional-label">(optionnel)</span>
                        <textarea
                          className="message-medecin"
                          placeholder="Votre message au médecin (optionnel)"
                          value={m.message || ''}
                          onChange={e => handleMessageChange(m.id, e.target.value)}
                          disabled={!!requests.find(r => r.medecin_id === m.id)}
                        />
                      </label>
                      <button
                        className="btn-request"
                        disabled={!!requests.find(r => r.medecin_id === m.id) || submittingId === m.id}
                        onClick={() => handleRequest(m)}
                      >
                        {(() => {
                          const already = requests.find(r => r.medecin_id === m.id);
                          return already
                            ? already.statut === 'en_attente'
                              ? 'En attente…'
                              : already.statut === 'accepte'
                                ? 'Accepté ✅'
                                : 'Refusé ✖︎'
                            : (submittingId === m.id ? '…' : 'Demander');
                        })()}
                      </button>
                    </div>
                  );
                })
            }
          </section>
        </>
      )}
    </div>
  );
}
