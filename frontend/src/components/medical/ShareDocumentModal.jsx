import React, { useEffect, useState } from 'react';
import './ShareDocumentModal.css';
import { generateShareLink } from '../../services/shareService';
import { getMedecins } from '../../services/userService';

const ShareDocumentModal = ({ documentId, onClose }) => {
  const [medecinId, setMedecinId] = useState('');
  const [duration, setDuration] = useState(24);
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [medecins, setMedecins] = useState([]);

  useEffect(() => {
    const fetchMedecins = async () => {
      try {
        const data = await getMedecins();
        setMedecins(data);
      } catch (err) {
        console.error('Erreur chargement médecins :', err);
      }
    };
    fetchMedecins();
  }, []);

  const handleShare = async () => {
    setLoading(true);
    try {
      const data = await generateShareLink({
        selectedDocs: [documentId],
        medecinId: medecinId || null,
        dureeEnHeures: duration
      });
      setShareLink(data.lien);
    } catch (err) {
      console.error('Erreur génération lien :', err);
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3> Partager ce document</h3>

        <label>Durée de validité (heures)</label>
        <input
          type="number"
          min="1"
          max="168"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
        />

        <label>Médecin destinataire (optionnel)</label>
        <select value={medecinId} onChange={(e) => setMedecinId(e.target.value)}>
          <option value="">-- Aucun (lien public) --</option>
          {medecins.map((m) => (
            <option key={m.id} value={m.id}>
              {m.prenom} {m.nom} ({m.specialite})
            </option>
          ))}
        </select>

        <button onClick={handleShare} disabled={loading}>
          {loading ? 'Génération...' : 'Générer le lien'}
        </button>

        {shareLink && (
            <div className="share-result">
                <p>Lien généré :</p>
                <div className="share-link-container">
                <input type="text" value={shareLink} readOnly />
                <button className="copy-btn" onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                }}>
                     Copier
                </button>
                </div>
            </div>
            )}


        <button className="close-btn" onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

export default ShareDocumentModal;
