// src/pages/medical/DocumentsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadForm from '../../components/medical/UploadForm';
import DocumentList from '../../components/medical/DocumentList';
import { getUserDocuments } from '../../services/documentService';
import './DocumentsPage.css';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const navigate = useNavigate();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('getUserDocuments:', err);
      setError('Impossible de charger les documents.');
    } finally {
      setLoading(false);
    }
  }, []);

  // charge au montage
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <div className="documents-page">
      <button onClick={() => navigate(-1)} className="back-button">
        ⬅ Retour
      </button>
      <h2>📁 Mes documents médicaux</h2>

      {/* UploadForm appelle fetchDocuments via onUpload */}
      <UploadForm onUpload={fetchDocuments} />

      <hr />

      {/* états */}
      {loading && <p className="loader">Chargement…</p>}
      {error   && <p className="error">{error}</p>}

      {/* Liste sans re-fetch interne */}
      {!loading && !error && (
        <DocumentList
          documents={documents}
          onDelete={fetchDocuments}
        />
      )}
    </div>
  );
}
