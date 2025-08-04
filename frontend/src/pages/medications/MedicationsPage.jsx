// src/pages/medications/MedicationsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMedicationsApi, deleteMedicationApi } from '../../services/medicationService';
import './MedicationsPage.css';
import ConfirmationModal from '../../components/ui/ConfirmationModal';


const MedicationsPage = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
    const [fadeOut, setFadeOut] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
const [visibleConfirm, setVisibleConfirm] = useState(false);

const handleDelete = (id) => {
  setSelectedId(id);
  setVisibleConfirm(true);
};

const confirmDelete = async () => {
  try {
    await deleteMedicationApi(selectedId);
    setMedications(prev => prev.filter(med => med.id !== selectedId));
    setMessage('✅ Médicament supprimé.');
  } catch (err) {
    setMessage('❌ Erreur lors de la suppression.');
  } finally {
    setVisibleConfirm(false);
    setSelectedId(null);
  }
};
    useEffect(() => {
  if (message) {
    setFadeOut(false); // Réinitialiser si un nouveau message s’affiche

    const fadeTimer = setTimeout(() => {
      setFadeOut(true); // Lancer l'effet visuel
    }, 2500); // Fade après 2.5s

    const clearTimer = setTimeout(() => {
      setMessage('');
    }, 3000); // Disparaît après 3s

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(clearTimer);
    };
  }
}, [message]);


  useEffect(() => {
    fetchMedications();
  }, []);
const parsedMeds = medications.map(med => ({
  ...med,
  frequence: typeof med.frequence === 'string' ? JSON.parse(med.frequence) : med.frequence
}));

  const fetchMedications = async () => {
    setLoading(true);
    try {
      const data = await getMedicationsApi();
      setMedications(data);
    } catch (error) {
      setMessage('❌ Erreur lors du chargement des médicaments.');
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (id) => navigate(`/medications/edit/${id}`);
const handleAdd = () => navigate('/medications/create');

const formatHeure = (heure) => {
  if (!heure) return 'Non spécifiée';
  const [h, m] = heure.split(':');
  return `${h}h${m}`;
};



  return (
    <div className="medications-page">
        <button className="btn-retour" onClick={() => navigate('/dashboard')}>⬅ Retour</button>
      <h2>💊 Mes Médicaments</h2>
      {message && <p className={`message ${fadeOut ? 'fade-out' : ''}`}>{message}</p>}


      <button className="btn-ajouter" onClick={handleAdd}>➕ Ajouter un médicament</button>

      {loading ? (
        <p>Chargement...</p>
      ) : medications.length === 0 ? (
        <p>Aucun médicament enregistré.</p>
      ) : (
        <div className="medication-cards">
          {parsedMeds.map(med => (
            <div key={med.id} className="med-card">
                <h3>{med.nom_medicament}</h3>
                <p><strong>Dosage :</strong> {med.dose || 'Non spécifié'}</p>
                <p><strong>Du :</strong> {med.date_debut} <strong>au</strong> {med.date_fin || 'Indéfinie'}</p>
                <p><strong>Heure(s) de prise :</strong> {
  med.frequence?.type === 'custom' && med.frequence.hours?.length
    ? med.frequence.hours.map(h => h.slice(0, 5).replace(':', 'h')).join(', ')
    : med.frequence?.type === 'interval'
      ? `Toutes les ${Math.floor(med.frequence.interval / 60)}h${med.frequence.interval % 60 !== 0 ? med.frequence.interval % 60 + 'min' : ''} de ${med.frequence.start} à ${med.frequence.end}`
      : 'Non spécifié'
}</p>

                <div className="btn-group">
                <button className="btn-edit" onClick={() => handleEdit(med.id)}>🖊 Modifier</button>
                <button className="btn-delete" onClick={() => handleDelete(med.id)}>🗑 Supprimer</button>
                </div>
            </div>
          ))}
        </div>
      )}

<ConfirmationModal
  visible={visibleConfirm}
  message="Supprimer ce médicament ?"
  onConfirm={confirmDelete}
  onClose={() => setVisibleConfirm(false)}
/>
    </div>
    
  );
};


export default MedicationsPage;
