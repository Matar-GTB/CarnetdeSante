import React, { useState } from 'react';
import './MedicationFrequencySelector.css';

const DEFAULT_HOURS = ['08:00', '14:00', '20:00', '23:00'];

const MedicationFrequencySelector = ({ onChange }) => {
  const [mode, setMode] = useState('custom');
  const [frequency, setFrequency] = useState(1);
  const [hours, setHours] = useState([DEFAULT_HOURS[0]]);
  const [interval, setInterval] = useState(30); // en minutes
  const [intervalStart, setIntervalStart] = useState('08:00');
  const [intervalEnd, setIntervalEnd] = useState('20:00');

  // Met à jour le parent à chaque changement
  React.useEffect(() => {
    if (mode === 'custom') {
      onChange({ type: 'custom', hours });
    } else {
      onChange({
        type: 'interval',
        interval: parseInt(interval),
        start: intervalStart,
        end: intervalEnd
      });
    }
    // eslint-disable-next-line
  }, [mode, frequency, hours, interval, intervalStart, intervalEnd]);

  // Gère la sélection du nombre de prises
  const handleFrequencyChange = (e) => {
    const n = parseInt(e.target.value);
    setFrequency(n);
    setHours((prev) => {
      const copy = [...prev];
      while (copy.length < n) copy.push('');
      while (copy.length > n) copy.pop();
      return copy;
    });
  };

  // Gère la modification d’un horaire
  const handleHourChange = (idx, value) => {
    setHours((prev) => {
      const arr = [...prev];
      arr[idx] = value;
      return arr;
    });
  };

  return (
    <div className="frequency-selector">
      <div className="freq-toggle-row">
        <label className="freq-radio">
          <input
            type="radio"
            checked={mode === 'custom'}
            onChange={() => setMode('custom')}
          />
          <span>Choisir les heures précises</span>
        </label>
        <label className="freq-radio">
          <input
            type="radio"
            checked={mode === 'interval'}
            onChange={() => setMode('interval')}
          />
          <span>Rappel toutes les X h / min</span>
        </label>
      </div>

      {mode === 'custom' ? (
        <>
          <label className="freq-label">
            Nombre de prises par jour :
            <select value={frequency} onChange={handleFrequencyChange}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <div className="hours-list">
            {Array.from({ length: frequency }).map((_, idx) => (
              <div key={idx} className="hour-row">
                <span>Prise {idx + 1}</span>
                <input
                  type="time"
                  value={hours[idx] || ''}
                  onChange={e => handleHourChange(idx, e.target.value)}
                  required
                  className="hour-input"
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="interval-row">
          <label className="freq-label" style={{marginBottom: 0}}>
            Intervalle :
            <input
              type="number"
              min="0"
              max="23"
              value={Math.floor(interval / 60)}
              onChange={e =>
                setInterval(prev => (parseInt(e.target.value, 10) * 60) + (prev % 60))
              }
              className="interval-input"
            />
            <span className="interval-label">h</span>
            <input
              type="number"
              min="0"
              max="59"
              value={interval % 60}
              onChange={e =>
                setInterval(prev => (Math.floor(prev / 60) * 60) + parseInt(e.target.value, 10))
              }
              className="interval-input"
            />
            <span className="interval-label">min</span>
          </label>
          <div className="interval-time-row">
            <label>
              Début :
              <input
                type="time"
                value={intervalStart}
                onChange={e => setIntervalStart(e.target.value)}
                className="hour-input compact"
              />
            </label>
            <label>
              Fin :
              <input
                type="time"
                value={intervalEnd}
                onChange={e => setIntervalEnd(e.target.value)}
                className="hour-input compact"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationFrequencySelector;
