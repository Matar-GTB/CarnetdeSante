//src/pages/medical/DocumentsPage.jsx
import React from 'react';
import UploadForm from '../../components/medical/UploadForm';
import DocumentList from '../../components/medical/DocumentList';
import { useNavigate } from 'react-router-dom';
import './DocumentsPage.css';

const DocumentsPage = () => {
    const navigate = useNavigate();
  return (
    <div className="documents-page">
    <button onClick={() => navigate(-1)} className="back-button">⬅️ Retour</button>
      <h2>📁 Mes documents médicaux</h2>
      <UploadForm />
      <hr />
      <DocumentList />
    </div>
  );
};

export default DocumentsPage;
