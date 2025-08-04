import React, { useEffect, useState, useCallback, useContext } from 'react';
import './VaccinationsPage.css';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext'          
import { jsPDF } from 'jspdf';
import {
  getVaccinations,
  addVaccination,
  deleteVaccination,
  updateVaccination
} from '../../services/vaccinationService';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import StatistiquesVaccination from '../../components/vaccinations/StatistiquesVaccination';

const VaccinationPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { role } = useContext(AuthContext);

  const [vaccins, setVaccins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Carnet de Vaccination', 20, 20);
    
    doc.setFontSize(12);
    vaccins.forEach((v, i) => {
      const y = 40 + (i * 30);
      doc.text(`${v.nom_vaccin} (Dose ${v.dose})`, 20, y);
      if (v.date_administration) {
        doc.text(`Administré le : ${new Date(v.date_administration).toLocaleDateString('fr-FR')}`, 20, y + 7);
      }
      if (v.date_rappel) {
        doc.text(`Rappel prévu le : ${new Date(v.date_rappel).toLocaleDateString('fr-FR')}`, 20, y + 14);
      }
      if (v.notes) {
        doc.text(`Notes : ${v.notes}`, 20, y + 21);
      }
    });
    
    doc.save('carnet-vaccination.pdf');
  }, [vaccins]);

  const [form, setForm] = useState({
    nom_vaccin: '',
    categorie: 'recommande', // obligatoire ou recommande
    dose: 1,
    date_administration: '',
    date_rappel: '',
    lieu_vaccination: '',
    professionnel_sante: '',
    notes: '',
    statut: 'en_attente',
    creerRappel: false,
    creerRappelAuto: false,
    creerRappelProchain: false,
    canaux_notification: {
      email: true,
      sms: false,
      push: true
    }
  });
  const [editId, setEditId] = useState(null);
  const [ongletPrincipal, setOngletPrincipal] = useState('carnet'); // 'carnet' ou 'nouveau'
  const [sousOngletCarnet, setSousOngletCarnet] = useState('reçus'); // 'reçus' ou 'avenir'
  const [modalVisible, setModalVisible] = useState(false);
  const [vaccinToDelete, setVaccinToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('reçus');

  const fetchVaccins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVaccinations(patientId);
      setVaccins(data);
    } catch (err) {
      setError("Erreur lors du chargement des vaccins.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchVaccins();
  }, [fetchVaccins]);

  // Debug effect
  useEffect(() => {
    console.log('Onglet principal:', { ongletPrincipal, role });
  }, [ongletPrincipal, role]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage("");
    }, 2000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleToggleForm = () => {
    if (ongletPrincipal === 'carnet') {
      setOngletPrincipal('nouveau');
      setEditId(null);
      setForm({
        nom_vaccin: '',
        categorie: 'recommande',
        dose: 1,
        date_administration: '',
        date_rappel: '',
        lieu_vaccination: '',
        professionnel_sante: '',
        notes: '',
        statut: 'en_attente',
        creerRappel: false,
        creerRappelAuto: false,
        creerRappelProchain: false,
        canaux_notification: {
          email: true,
          sms: false,
          push: true
        }
      });
    } else {
      setOngletPrincipal('carnet');
    }
  };

  const handleAddVaccin = async (e) => {
    e.preventDefault();
    
    const { nom_vaccin } = form;

    if (!nom_vaccin) {
      setMessage("⚠️ Le nom du vaccin est obligatoire.");
      return;
    }

    // Vérification optionnelle de la cohérence des dates si les deux sont renseignées
    if (form.date_rappel && form.date_administration && new Date(form.date_rappel) < new Date(form.date_administration)) {
      setMessage("⚠️ La date de rappel doit être postérieure à la date de vaccination.");
      return;
    }

    // si on demande un rappel, la date admin devient obligatoire
    if ((form.creerRappelAuto || form.creerRappelProchain) && !form.date_administration) {
      setMessage("⚠️ Pour programmer un rappel, renseigne d’abord la date/heure de vaccination.");
      return;
    }
    // si rappel de prochaine dose, il faut aussi la date de rappel
    if (form.creerRappelProchain && !form.date_rappel) {
      setMessage("⚠️ Pour programmer le rappel de dose suivante, spécifie la date/heure de rappel.");
      return;
    }

    // Vérifie la cohérence des dates si elles sont renseignées
    if (form.date_rappel && form.date_administration && new Date(form.date_rappel) < new Date(form.date_administration)) {
      setMessage("⚠️ La date de rappel doit être postérieure à la date de vaccination.");
      return;
    }

    // ✅ Envoi du payload complet au backend
    const vaccinPayload = {
      nom_vaccin,
      categorie: form.categorie,
      // Si la date d'administration n'est pas renseignée, on met la date du jour
      date_administration: form.date_administration || new Date().toISOString().split('T')[0],
      date_rappel: form.date_rappel,
      lieu_vaccination: form.lieu_vaccination,
      professionnel_sante: form.professionnel_sante,
      effets_secondaires: form.effets_secondaires,
      contre_indications: form.contre_indications,
      notes: form.notes,
      creerRappelAuto: form.creerRappelAuto,
      creerRappelProchain: form.creerRappelProchain,
      canaux_notification: form.canaux_notification,
      dose: form.dose
    };

    try {
      if (editId) {
        await updateVaccination(editId, vaccinPayload);
        setMessage("✏️ Mise à jour réussie ! Le vaccin a été modifié.");
        // Retourner à l'onglet carnet après édition
        setTimeout(() => {
          setOngletPrincipal('carnet');
        }, 2000);
      } else {
        await addVaccination(vaccinPayload);
        setMessage("✅ Nouveau vaccin ajouté avec succès !");
      }

      // Réinitialiser le formulaire
      setForm({
        nom_vaccin: '',
        categorie: 'recommande',
        dose: 1,
        date_administration: '',
        date_rappel: '',
        lieu_vaccination: '',
        professionnel_sante: '',
        notes: '',
        statut: 'en_attente',
        creerRappel: false,
        creerRappelAuto: false,
        creerRappelProchain: false,
        canaux_notification: {
          email: true,
          sms: false,
          push: true
        }
      });
      setEditId(null);
      
      // Rafraîchir la liste des vaccins
      await fetchVaccins();

    } catch (err) {
      console.error(err);
      setMessage(editId ? 
        "❌ Erreur lors de la mise à jour du vaccin." :
        "❌ Erreur lors de l'ajout du vaccin."
      );
    }
  };

  const confirmDeleteVaccin = (id) => {
    setVaccinToDelete(id);
    setModalVisible(true);
  };

  const handleConfirmedDelete = async () => {
    try {
      await deleteVaccination(vaccinToDelete);
      setVaccins(prev => prev.filter(v => v.id !== vaccinToDelete));
      setMessage("✅ Vaccin supprimé avec succès !");
      setEditId(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de la suppression.");
    } finally {
      setModalVisible(false);
      setVaccinToDelete(null);
    }
  };

  const isReminderSoon = dateStr => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffDays = (date - now) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 30;
  };

  const today = new Date();
  // D'abord on filtre par date d'administration
  const vaccinsFiltreParDate = vaccins.filter(v => {
    if (ongletPrincipal !== 'carnet') return true;
    const dateAdmin = new Date(v.date_administration);
    return sousOngletCarnet === 'reçus' ? dateAdmin <= today : dateAdmin > today;
  });

  // Ensuite on applique les filtres par statut sur les vaccins déjà filtrés par date
  const vaccinsComplet = vaccinsFiltreParDate.filter(v => v.statut === 'complet');
  const vaccinsAttente = vaccinsFiltreParDate.filter(v => v.statut === 'en_attente');
  const vaccinsIncomplet = vaccinsFiltreParDate.filter(v => v.statut === 'incomplet');
  const vaccinsTest = vaccinsFiltreParDate.filter(v => v.statut === 'test');

  // Ajoute la fonction handleEdit pour éditer un vaccin
  const handleEdit = (v) => {
    setEditId(v.id);
    setForm({
      nom_vaccin: v.nom_vaccin,
      categorie: v.categorie || 'recommande',
      dose: v.dose,
      date_administration: v.date_administration,
      date_rappel: v.date_rappel || '',
      lieu_vaccination: v.lieu_vaccination || '',
      professionnel_sante: v.professionnel_sante || '',
      notes: v.notes || '',
      statut: v.statut,
      creerRappel: false,
      creerRappelAuto: false,
      creerRappelProchain: false,
      canaux_notification: v.canaux_notification || {
        email: true,
        sms: false,
        push: true
      }
    });
    setMessage('');
  };

  // Ajoute cette fonction dans ton composant
  const handleProgrammerRappel = (vaccin) => {
    const nextDose = (vaccin.dose || 1) + 1;
    const nextRappelDate = calculateNextRappel(vaccin.date_administration);
    
    setOngletPrincipal('nouveau'); // Basculer vers le formulaire
    setForm({
      nom_vaccin: vaccin.nom_vaccin,
      categorie: vaccin.categorie || 'recommande',
      dose: nextDose,
      date_administration: '', // À remplir par l'utilisateur
      date_rappel: nextRappelDate,
      lieu_vaccination: vaccin.lieu_vaccination || '',
      professionnel_sante: vaccin.professionnel_sante || '',
      notes: `Rappel de la dose ${vaccin.dose}`,
      statut: 'en_attente',
      creerRappel: true,
      creerRappelAuto: true, // Activer par défaut
      creerRappelProchain: false,
      canaux_notification: {
        email: true,
        sms: true,
        push: true
      }
    });

    // Message explicatif
    setMessage(`📅 Programmation du rappel pour la dose ${nextDose} de ${vaccin.nom_vaccin}`);
    
    // Scroll vers le formulaire
    setTimeout(() => {
      const formEl = document.querySelector('.vaccination-form');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 1. Ajouter une fonction pour calculer la prochaine date de rappel
  const calculateNextRappel = useCallback((dateAdmin, intervalMois = 6) => {
    if (!dateAdmin) return null;
    const date = new Date(dateAdmin);
    date.setMonth(date.getMonth() + intervalMois);
    return date.toISOString().split('T')[0];
  }, []);

  return (
    <div className="vaccinations-page">
      <button onClick={() => navigate('/dashboard')} className="btn-retour">⬅ Retour</button>
      {patientId && (
        <button onClick={() => navigate('/patients')} className="btn-retour">⬅ Retour à mes patients</button>
      )}

      <h2>Suivi Vaccinal</h2>
      <p>Consultez vos vaccins ou ajoutez-en un nouveau.</p>

      <div className="navigation-vaccins">
        {/* Onglets principaux */}
        <div className="onglets-principaux">
          <button 
            className={`onglet-principal ${ongletPrincipal === 'carnet' ? 'actif' : ''}`}
            onClick={() => setOngletPrincipal('carnet')}
          >
            📖 Mon Carnet de Santé
          </button>
          <button 
            className={`onglet-principal ${ongletPrincipal === 'nouveau' ? 'actif' : ''}`}
            onClick={() => setOngletPrincipal('nouveau')}
          >
            ➕ Nouveau Vaccin
          </button>
        </div>

        {/* Sous-onglets uniquement visibles quand on est dans "Mon Carnet de Santé" */}
        {ongletPrincipal === 'carnet' && (
          <div className="sous-onglets">
            <button 
              className={`sous-onglet ${sousOngletCarnet === 'reçus' ? 'actif' : ''}`}
              onClick={() => setSousOngletCarnet('reçus')}
            >
              ✅ Vaccins reçus
            </button>
            <button 
              className={`sous-onglet ${sousOngletCarnet === 'avenir' ? 'actif' : ''}`}
              onClick={() => setSousOngletCarnet('avenir')}
            >
              📅 Vaccins à venir
            </button>
          </div>
        )}
      </div>

      {/* Contenu de l'onglet Carnet */}
      {ongletPrincipal === 'carnet' && (
        <>
          <StatistiquesVaccination vaccins={vaccins} />
          {/* Suppression du CalendrierVaccinal */}
          
          <div className="actions-bar">
            <button className="btn-export" onClick={handleExportPDF}>
              📄 Exporter en PDF
            </button>
          </div>
        </>
      )}

      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}

      {/* Contenu de l'onglet Nouvel Vaccin */}
      {ongletPrincipal === 'nouveau' && (
        <div className="nouveau-vaccin-container">
          <form id="ajout-vaccin-form" className="vaccination-form" onSubmit={handleAddVaccin}>
          <button 
            type="button"
            className="btn-close-form"
            onClick={handleToggleForm}
            aria-label="Fermer le formulaire"
          >
            ×
          </button>
          <h3>➕ Ajouter un vaccin</h3>

          {/* Note info pour la date */}
          <p className="note-info">
            💡 Si vous ne vous souvenez plus de la date précise, vous pouvez laisser le champ vide, sauf si un rappel est programmé.
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nom_vaccin">Nom du vaccin *</label>
              <input
                id="nom_vaccin"
                type="text"
                value={form.nom_vaccin}
                onChange={e => setForm({ ...form, nom_vaccin: e.target.value })}
                placeholder="Ex : Pfizer, AstraZeneca"
                aria-label="Nom du vaccin"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="categorie">Catégorie (optionnel)</label>
              <select
                id="categorie"
                value={form.categorie}
                onChange={e => setForm({ ...form, categorie: e.target.value })}
                className="form-control"
              >
                <option value="obligatoire">🔵 Obligatoire</option>
                <option value="recommande">🟢 Recommandé</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="lieu_vaccination">Lieu de vaccination</label>
              <input
                id="lieu_vaccination"
                type="text"
                value={form.lieu_vaccination}
                onChange={e => setForm({ ...form, lieu_vaccination: e.target.value })}
                placeholder="Ex : Cabinet médical, Centre de vaccination"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="professionnel_sante">Professionnel de santé</label>
              <input
                id="professionnel_sante"
                type="text"
                value={form.professionnel_sante}
                onChange={e => setForm({ ...form, professionnel_sante: e.target.value })}
                placeholder="Ex : Dr Dupont"
                className="form-control"
              />
            </div>
          </div>

          <label>Dose n°</label>
          <input
            type="number"
            min="1"
            value={form.dose}
            onChange={e => setForm({ ...form, dose: parseInt(e.target.value) || 1 })}
          />

          <label htmlFor="date_administration">
            Date de vaccination (optionnel)
          </label>
          <input
            id="date_administration"
            type="date"
            value={form.date_administration ? form.date_administration.split('T')[0] : ''}
            onChange={e => setForm(f => ({ ...f, date_administration: e.target.value }))}
            placeholder="Laisser vide si juste pour record"
            aria-label="Date de vaccination"
          />

          <label>
            Date du rappel (optionnel)
          </label>
          <input
            type="date"
            value={form.date_rappel ? form.date_rappel.split('T')[0] : ''}
            onChange={e => setForm(f => ({ ...f, date_rappel: e.target.value }))}
            placeholder="Date de rappel optionnelle"
          />

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Ajoutez ici vos observations, effets secondaires et contre-indications..."
              className="form-control notes"
              rows="6"
            ></textarea>
            <small className="note-info">
              💡 Utilisez ce champ pour noter les effets secondaires observés, les contre-indications et toute autre observation importante.
            </small>
          </div>

          <label>Statut</label>
          <select
            value={form.statut}
            onChange={e => setForm({ ...form, statut: e.target.value })}
          >
            <option value="en_attente">⏳ En attente</option>
            <option value="complet">✅ Complet</option>
            <option value="incomplet">⚠️ Incomplet</option>
            <option value="test">🧪 Test</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={form.creerRappelAuto}
              onChange={() => setForm({ ...form, creerRappelAuto: !form.creerRappelAuto })}
            />
            Rappel auto 24 h avant
          </label>
          <div className="form-section">
            <h4>🔔 Notifications</h4>
            <div className="notifications-grid">
              <label>
                <input
                  type="checkbox"
                  checked={form.canaux_notification.email}
                  onChange={() => setForm(f => ({
                    ...f,
                    canaux_notification: {
                      ...f.canaux_notification,
                      email: !f.canaux_notification.email
                    }
                  }))}
                />
                Rappel par email
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.canaux_notification.sms}
                  onChange={() => setForm(f => ({
                    ...f,
                    canaux_notification: {
                      ...f.canaux_notification,
                      sms: !f.canaux_notification.sms
                    }
                  }))}
                />
                Rappel par SMS
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.canaux_notification.push}
                  onChange={() => setForm(f => ({
                    ...f,
                    canaux_notification: {
                      ...f.canaux_notification,
                      push: !f.canaux_notification.push
                    }
                  }))}
                />
                Notifications push
              </label>
            </div>
          </div>

          <div className="form-actions">
            {editId && (
            <button
              type="button"
              onClick={() => {
                setForm({ nom_vaccin: '', dose: 1, date_administration: '', date_rappel: '', notes: '', statut: 'en_attente', creerRappel: false });
                setEditId(null);
                setMessage('');
              }}
              className="btn-annuler"
            >
              ❌ Annuler modification
            </button>
          )}
          <button type="submit">Enregistrer</button>
          </div>
        </form>
        </div>
      )}

      {/* Cette section a été déplacée dans l'onglet Carnet */}

      {loading ? (
        <p>Chargement des vaccins...</p>
      ) : !vaccinsFiltreParDate.length ? (
        <p>Aucun vaccin enregistré.</p>
      ) : (
        <div className="vaccination-list">
          {vaccinsFiltreParDate.map(v => (
            <div
              key={v.id}
              className={`vaccin-card${editId === v.id ? ' vaccin-card-editing' : ''}`}
              aria-label={`Carte vaccin ${v.nom_vaccin} dose ${v.dose}`}
            >
              <h4>{v.nom_vaccin} (Dose {v.dose})</h4>
              <p>Date : {v.date_administration ? new Date(v.date_administration).toLocaleDateString('fr-FR') : <em>Non renseignée</em>}</p>
              {v.date_rappel && (
                <p style={{ color: isReminderSoon(v.date_rappel) ? 'red' : 'black' }}>
                  Rappel : {new Date(v.date_rappel).toLocaleDateString('fr-FR')}
                  {isReminderSoon(v.date_rappel) && (
                    <span className="badge-rappel-soon" aria-label="Rappel imminent">Rappel imminent 🔔</span>
                  )}
                </p>
              )}
              {v.notes && <p><strong>Notes :</strong> {v.notes}</p>}
              <span className={`badge-statut badge-${v.statut}`}>{v.statut.toUpperCase()}</span>
              {editId === v.id && <span className="badge-edition">🛠️ En cours d'édition</span>}
              <button
                onClick={() => handleEdit(v)}
                className="btn-modifier"
                aria-label="Modifier ce vaccin"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => confirmDeleteVaccin(v.id)}
                className="btn-supprimer"
                aria-label="Supprimer ce vaccin"
              >
                ❌ Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {vaccinsComplet.length > 0 && (
        <div className="section-vaccins-complets">
          <h3>✅ Vaccins complets</h3>
          {vaccinsComplet.map(v => (
            <div key={v.id} className="vaccin-card">
              <h4>{v.nom_vaccin} (Dose {v.dose})</h4>
              <p>Date : {new Date(v.date_administration).toLocaleDateString('fr-FR')}</p>
              {v.date_rappel && <p>Rappel : {new Date(v.date_rappel).toLocaleDateString('fr-FR')}</p>}
              {v.notes && <p><strong>Notes :</strong> {v.notes}</p>}
              <span className={`badge-statut badge-${v.statut}`}>{v.statut.toUpperCase()}</span>
              {role === 'patient' && (
                <div className="vaccin-actions">
                  <button onClick={() => handleEdit(v)} className="btn-modifier">✏️ Modifier</button>
                  <button onClick={() => confirmDeleteVaccin(v.id)} className="btn-supprimer">❌ Supprimer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {vaccinsAttente.length > 0 && (
        <div className="section-vaccins-attente">
          <h3>⏳ Vaccins en attente de rappel</h3>
          {vaccinsAttente.map(v => (
            <div key={v.id} className="vaccin-card">
              <h4>{v.nom_vaccin} (Dose {v.dose})</h4>
              <p>Date : {new Date(v.date_administration).toLocaleDateString('fr-FR')}</p>
              {v.date_rappel && <p>Rappel : {new Date(v.date_rappel).toLocaleDateString('fr-FR')}</p>}
              {v.notes && <p><strong>Notes :</strong> {v.notes}</p>}
              <div className="vaccin-actions">
                {role === 'patient' && (
                  <>
                    <button onClick={() => handleProgrammerRappel(v)} className="btn-modifier">
                      ➕ Programmer un rappel
                    </button>
                    <button onClick={() => handleEdit(v)} className="btn-modifier">✏️ Modifier</button>
                    <button onClick={() => confirmDeleteVaccin(v.id)} className="btn-supprimer">❌ Supprimer</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {vaccinsIncomplet.length > 0 && (
        <div className="section-vaccins-incomplets">
          <h3>⚠️ Vaccins incomplets</h3>
          {vaccinsIncomplet.map(v => (
            <div key={v.id} className="vaccin-card">
              <h4>{v.nom_vaccin} (Dose {v.dose})</h4>
              <p>Date : {new Date(v.date_administration).toLocaleDateString('fr-FR')}</p>
              {v.date_rappel && <p>Rappel : {new Date(v.date_rappel).toLocaleDateString('fr-FR')}</p>}
              {v.notes && <p><strong>Notes :</strong> {v.notes}</p>}
              <span className={`badge-statut badge-${v.statut}`}>{v.statut.toUpperCase()}</span>
              {role === 'patient' && (
                <div className="vaccin-actions">
                  <button onClick={() => handleProgrammerRappel(v)} className="btn-modifier">
                    ➕ Programmer un rappel
                  </button>
                  <button onClick={() => handleEdit(v)} className="btn-modifier">✏️ Modifier</button>
                  <button onClick={() => confirmDeleteVaccin(v.id)} className="btn-supprimer">❌ Supprimer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {vaccinsTest.length > 0 && (
        <div className="section-vaccins-test">
          <h3>🧪 Tests / Dosages</h3>
          {vaccinsTest.map(v => (
            <div key={v.id} className="vaccin-card">
              <h4>{v.nom_vaccin} (Dose {v.dose})</h4>
              <p>Date : {new Date(v.date_administration).toLocaleDateString('fr-FR')}</p>
              {v.notes && <p><strong>Notes :</strong> {v.notes}</p>}
              <span className={`badge-statut badge-${v.statut}`}>{v.statut.toUpperCase()}</span>
              {role === 'patient' && (
                <div className="vaccin-actions">
                  <button onClick={() => handleEdit(v)} className="btn-modifier">✏️ Modifier</button>
                  <button onClick={() => confirmDeleteVaccin(v.id)} className="btn-supprimer">❌ Supprimer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmedDelete}
        message="Voulez-vous vraiment supprimer ce vaccin ? Cette action est irréversible."
      />
    </div>
  );
};

export default VaccinationPage;
