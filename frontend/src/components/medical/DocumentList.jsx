// src/components/medical/DocumentList.jsx
import React from 'react';
import DocumentCard from './DocumentCard';
import './DocumentList.css';

export default function DocumentList({ documents, onDelete }) {
  if (documents.length === 0) {
    return <p className="empty">Vous n’avez aucun document.</p>;
  }

  return (
    <div className="document-list">
      {documents.map(doc => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
