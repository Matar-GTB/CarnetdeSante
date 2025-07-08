// frontend/src/components/medical/DocumentCard.jsx
import React, { useState } from 'react';
import './DocumentCard.css';
import { downloadDocument } from '../../services/documentService';
import ShareDocumentModal from './ShareDocumentModal';
import axios from 'axios';

const DocumentCard = ({ document, onDelete }) => {
  const [showModal, setShowModal] = useState(false);

  const handleDownload = async () => {
    try {
      const blob = await downloadDocument(document.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.nom_fichier || 'document.pdf');
      window.document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erreur téléchargement :', err);
      alert('Erreur lors du téléchargement du fichier.');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Supprimer le document "${document.titre}" ?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/medical/documents/${document.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      alert("Document supprimé ✅");
      if (onDelete) onDelete(document.id);
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Échec de la suppression ❌");
    }
  };

  return (
    <div className="document-card">
      <h4>{document.type_document}</h4>
      <p><strong>Titre :</strong> {document.titre}</p>
      <p><strong>Nom fichier :</strong> {document.nom_fichier || document.url_fichier}</p>
      <p><strong>Date :</strong> {document.date_document}</p>
      <div className="document-actions">
        <button onClick={handleDownload}>📥 Télécharger</button>
        <button onClick={handleDelete}>🗑️ Supprimer</button>
        <button onClick={() => setShowModal(true)}>🔗 Partager</button>
      </div>

      {showModal && (
        <ShareDocumentModal documentId={document.id} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default DocumentCard;
