import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './MedicationForm.css';
import { addMedicationApi, updateMedicationApi, getMedicationByIdApi } from '../../services/medicationService';
import MedicationFrequencySelector from './MedicationFrequencySelector';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

const MedicationForm = ({ initialData }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialData || {
    nom_medicament: '',
    dose: '',
    date_debut: '',
    date_fin: '',
    rappel: true
  });
  const [message, setMessage] = useState('');
  const [frequencyData, setFrequencyData] = useState({ type: 'custom', hours: ['08:00'] });
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

useEffect(() => {
  const fetchData = async () => {
    if (id && !initialData) {
      try {
        const med = await getMedicationByIdApi(id); // à créer dans medicationService
        setForm({
          nom_medicament: med.nom_medicament,
          dose: med.dose,
          date_debut: med.date_debut,
          date_fin: med.date_fin,
          rappel: med.rappel,
          heure_prise: med.heure_prise,
        });
        setFrequencyData(med.frequence || { type: 'custom', hours: ['08:00'] });
        setEditId(med.id);

      } catch (err) {
        console.error('Erreur chargement médicament:', err);
      }
    }
  };

  fetchData();
}, [id, initialData]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const dataToSend = {
      ...form,
      rappel_actif: form.rappel,
      frequence: frequencyData,
    };

    const result = editId || id
      ? await updateMedicationApi(editId || id, dataToSend)
      : await addMedicationApi(dataToSend);

    setMessage(editId || id ? '✏️ Médicament mis à jour.' : '✅ Médicament enregistré.');
    setTimeout(() => navigate('/rappels'), 1500);
  } catch (error) {
    setMessage('❌ Erreur enregistrement.');
    console.error(error);
  }
};

if ((id && !form.nom_medicament)) {
  return <p style={{ padding: "2rem", textAlign: "center" }}>Chargement du médicament...</p>;
}

  return (
    <div className="medication-form-container">
      <button className="btn-retour" onClick={() => navigate('/medications')}>⬅ Retour</button>
      <h2>💊 {editId || id ? 'Modifier' : 'Ajouter'} un médicament</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} className="medication-form">
        {/* ====== ÉTAPE 1 ====== */}
        {step === 1 && (
          <>
            <label>Nom du médicament <span className="required-star">*</span>
              <input type="text" name="nom_medicament" value={form.nom_medicament} onChange={handleChange} required />
            </label>
            <label>Dosage (ex: 1 comprimé de 500mg) <span className="optional-label">(optionnel)</span>
              <input type="text" name="dose" value={form.dose} onChange={handleChange} />
            </label>
            <button type="button" onClick={nextStep}>Suivant</button>
          </>
        )}

        {/* ====== ÉTAPE 2 ====== */}
        {step === 2 && (
          <>
            <label>Date de début  <span className="required-star">*</span>
              <input type="date" name="date_debut" value={form.date_debut} onChange={handleChange} required />
            </label>
            <label>Date de fin <span className="optional-label">(optionnel)</span>
              <input type="date" name="date_fin" value={form.date_fin} onChange={handleChange} />
            </label>
            <div className="step-buttons">
              <button type="button" onClick={prevStep}>Précédent</button>
              <button type="button" onClick={nextStep}>Suivant</button>
            </div>
          </>
        )}

        {/* ====== ÉTAPE 3 ====== */}
        {step === 3 && (
          <>
            <label>
              <input type="checkbox" name="rappel" checked={form.rappel} onChange={handleChange} />
              Activer les rappels ?
            </label>
            <MedicationFrequencySelector onChange={setFrequencyData} />
            <div className="step-buttons">
              <button type="button" onClick={prevStep}>Précédent</button>
              <button type="submit">{editId || id ? 'Mettre à jour' : 'Enregistrer'}</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default MedicationForm;