import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MedicationForm.css';
import { addMedicationApi } from '../../services/medicationService';
import { creerRappelApi } from '../../services/rappelService';
import MedicationFrequencySelector from './MedicationFrequencySelector'; // Place-le ici
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

const MedicationForm = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nom_medicament: '',
    dose: '',
    date_debut: '',
    date_fin: '',
    rappel: true
  });
  const [message, setMessage] = useState('');
  const [frequencyData, setFrequencyData] = useState({ type: 'custom', hours: ['08:00'] });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };
const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMedicationApi(form);

      if (form.rappel) {
        const rappels = [];
        const dateDebut = form.date_debut;
        const dateFin = form.date_fin || form.date_debut;
        let dateCourante = dayjs(dateDebut);

        while (dateCourante.isSameOrBefore(dayjs(dateFin))) {
          const thisDate = dateCourante.format('YYYY-MM-DD'); // Snapshot de la date

          if (frequencyData.type === 'custom') {
            frequencyData.hours.forEach(heure => {
              if (heure)
                rappels.push({
                  type_rappel: 'médicament',
                  details: {
                    nom_medicament: form.nom_medicament,
                    dose: form.dose,
                    date_debut: dateDebut,
                    date_fin: dateFin,
                    heure_prise: heure,
                    date_heure: `${thisDate}T${heure}`
                  },
                  recurrence: 'aucune',
                  canaux: ['notification']
                });
            });
          } else if (frequencyData.type === 'interval') {
            let start = dayjs(`${thisDate}T${frequencyData.start}`);
            let end = dayjs(`${thisDate}T${frequencyData.end}`);
            let cur = start;
            while (cur.isSameOrBefore(end)) {
              rappels.push({
                type_rappel: 'médicament',
                details: {
                  nom_medicament: form.nom_medicament,
                  dose: form.dose,
                  date_debut: dateDebut,
                  date_fin: dateFin,
                  heure_prise: cur.format('HH:mm'),
                  date_heure: cur.format('YYYY-MM-DDTHH:mm')
                },
                recurrence: `intervalle:${frequencyData.interval}`,
                canaux: ['notification']
              });
              cur = cur.add(frequencyData.interval, 'minute');
            }
          }
          dateCourante = dateCourante.add(1, 'day');
        }

        for (const rappel of rappels) {
          await creerRappelApi(rappel);
        }
      }

      setMessage('✅ Médicament enregistré.');
      setTimeout(() => navigate('/rappels'), 1500);
    } catch (error) {
      setMessage('❌ Erreur enregistrement.');
      console.error(error);
    }
  };

 return (
    <div className="medication-form-container">
      <button className="btn-retour" onClick={() => navigate('/dashboard')}>⬅ Retour</button>
      <h2>💊 Ajouter un médicament</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} className="medication-form">

        {/* ====== ÉTAPE 1 ====== */}
        {step === 1 && (
          <>
            <label>Nom du médicament <span className="required-star">*</span>
              <input type="text" name="nom_medicament" value={form.nom_medicament} onChange={handleChange} required />
            </label>
            <label>Dosage (ex: 500mg) <span className="optional-label">(optionnel)</span>
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
              <button type="submit"> Enregistrer</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default MedicationForm;