import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PartageLienPublic = () => {
  const { token } = useParams();
  const [infos, setInfos] = useState(null);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sharing/documents/${token}`);
        setInfos(res.data);

        const docIds = res.data.documents;
        const docRes = await axios.get(`http://localhost:5000/api/medical/documents`, {
          headers: {
            Authorization: `Bearer ${token}` // ou skip si endpoint public ou fake token
          }
        });

        // Filtrer uniquement les docs partagés
        const filtered = docRes.data.filter((doc) => docIds.includes(doc.id));
        setDocuments(filtered);
      } catch (err) {
        setError("Lien invalide ou expiré ❌");
      }
    };

    fetchSharedData();
  }, [token]);

  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;
  if (!infos) return <p style={{ padding: '2rem' }}>Chargement...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📄 Documents partagés par le patient</h2>
      <p>Valide jusqu’au : <strong>{new Date(infos.expiration).toLocaleString()}</strong></p>

      {documents.length === 0 ? (
        <p>Aucun document trouvé.</p>
      ) : (
        <ul>
          {documents.map((doc) => (
            <li key={doc.id} style={{ margin: '1rem 0' }}>
              <strong>{doc.titre}</strong> — <em>{doc.type_document}</em><br />
              📅 {doc.date_document} <br />
              🔗 <a href={`http://localhost:5000/uploads/${doc.url_fichier}`} target="_blank" rel="noopener noreferrer">Voir le fichier</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PartageLienPublic;
