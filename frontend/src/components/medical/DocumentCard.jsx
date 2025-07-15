// src/components/medical/DocumentCard.jsx
import React, { useState } from 'react';
import './DocumentCard.css';
import { downloadDocument, deleteDocument } from '../../services/documentService';
import ShareDocumentModal from './ShareDocumentModal';
import ConfirmDialog from '../ui/ConfirmDialog';

const DocumentCard = ({ document, onDelete }) => {
  const [showShare, setShowShare]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState(null);

  const handleDownload = async () => {
    setError(null);
    try {
      const { blob, filename } = await downloadDocument(document.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement :', err);
      setError('Impossible de télécharger le fichier.');
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteDocument(document.id);
      onDelete(document.id);
    } catch (err) {
      console.error('Erreur suppression :', err);
      setError('Impossible de supprimer le document.');
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="document-card">
      {error       && <div className="doc-error">{error}</div>}
      <h4>{document.type_document}</h4>
      <p><strong>Titre :</strong> {document.titre}</p>
      <p><strong>Fichier :</strong> {document.nom_fichier || document.url_fichier}</p>
      <p><strong>Date :</strong> {document.date_document}</p>

      <div className="document-actions">
        <button onClick={handleDownload}>⬇️ Télécharger</button>
        <button onClick={() => setShowConfirm(true)}>🗑️ Supprimer</button>
        <button onClick={() => setShowShare(true)}>🔗 Partager</button>
      </div>

      {showConfirm && (
        <ConfirmDialog
          message={`Supprimer "${document.titre}" ?`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showShare && (
        <ShareDocumentModal
          documentId={document.id}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
};

export default DocumentCard;
