import { useState } from 'react';
import './Partage.css';

export default function Partage({ user }) {
  const [documents, setDocuments] = useState(user.documents || []);
  const [partages, setPartages] = useState(user.partages || []);
  const [selection, setSelection] = useState([]);
  const [duree, setDuree] = useState('3');

  const handleCheck = (docId) => {
    setSelection((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const genererLien = () => {
    if (selection.length === 0) return alert('Sélectionne au moins un document');

    const lien = {
      id: Date.now(),
      docs: documents.filter((d) => selection.includes(d.id)),
      expire: new Date(Date.now() + duree * 86400000).toLocaleDateString(),
      lien: `https://moncarnet.com/partage/${Date.now()}`,
      consultes: []
    };

    setPartages([lien, ...partages]);
    setSelection([]);
    setDuree('3');
    alert(' Lien généré avec succès');
  };

  const supprimerLien = (id) => {
    setPartages(partages.filter((p) => p.id !== id));
  };

  return (
    <div className="partage-page">
      <h1>🔐 Partage sécurisé</h1>

      {/*  Liste de documents */}
      <div className="bloc-docs">
        <h2>Documents disponibles</h2>
        <ul className="doc-list">
          {documents.length === 0 ? (
            <li>Aucun document à partager</li>
          ) : (
            documents.map((doc) => (
              <li key={doc.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selection.includes(doc.id)}
                    onChange={() => handleCheck(doc.id)}
                  />
                  {doc.nom} ({doc.type})
                </label>
              </li>
            ))
          )}
        </ul>

        <div className="parametres">
          <label>
            Durée de validité :
            <select value={duree} onChange={(e) => setDuree(e.target.value)}>
              <option value="1">1 jour</option>
              <option value="3">3 jours</option>
              <option value="7">7 jours</option>
            </select>
          </label>
          <button onClick={genererLien} disabled={selection.length === 0}>
             Générer le lien
          </button>
        </div>
      </div>

      {/*  Historique */}
      <div className="bloc-lien">
        <h2>Liens générés</h2>
        <ul className="lien-list">
          {partages.length === 0 ? (
            <li>Aucun lien généré</li>
          ) : (
            partages.map((p) => (
              <li key={p.id}>
                <p><strong>Lien :</strong> <a href={p.lien} target="_blank">{p.lien}</a></p>
                <p><strong>Expire le :</strong> {p.expire}</p>
                <p>
                  <strong>Documents :</strong>{' '}
                  {p.docs.map((d) => d.nom).join(', ')}
                </p>
                <p>
                  <strong>Consultations :</strong>{' '}
                  {p.consultes.length === 0 ? 'Aucune' : p.consultes.join(', ')}
                </p>
                <button onClick={() => supprimerLien(p.id)} className="btn-delete">
                  ❌ Supprimer le lien
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
