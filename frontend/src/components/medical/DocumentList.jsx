import React, { useEffect, useState, useCallback } from 'react';
import DocumentCard from './DocumentCard';
import './DocumentList.css';
import { getUserDocuments } from '../../services/documentService';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Utilisation de useCallback pour mémoriser la fonction
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserDocuments();
      setDocuments(data);
      setError(null);
    } catch (err) {
      console.error("Erreur récupération documents :", err);
      setError("Impossible de charger les documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]); // Dépendance stable grâce à useCallback

  const handleDeleteDocument = (idToDelete) => {
    setDocuments(prev => prev.filter(doc => doc.id !== idToDelete));
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="error">{error}</p>;
  if (documents.length === 0) return <p>Aucun document disponible.</p>;

  return (
    <div className="document-list">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onDelete={handleDeleteDocument}
        />
      ))}
    </div>
  );
};

export default DocumentList;