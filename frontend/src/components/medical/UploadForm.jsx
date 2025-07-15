// src/components/medical/UploadForm.jsx
import React, { useState } from 'react';
import './UploadForm.css';
import { uploadDocument } from '../../services/documentService';

export default function UploadForm({ onUpload }) {
  const [file, setFile]           = useState(null);
  const [titre, setTitre]         = useState('');
  const [typeDoc, setTypeDoc]     = useState('');
  const [categorie, setCategorie] = useState('');
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState({ text: '', type: '' });

  const clearForm = () => {
    setFile(null);
    setTitre('');
    setTypeDoc('');
    setCategorie('');
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file || !titre || !typeDoc) {
      showMessage('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('titre',           titre);
    formData.append('type_document',   typeDoc);
    formData.append('categorie',       categorie);
    formData.append('fichier',         file);

    try {
      setLoading(true);
      await uploadDocument(formData);
      showMessage('Document téléversé avec succès ✅', 'success');
      clearForm();
      if (typeof onUpload === 'function') {
        onUpload(); // parent peut recharger la liste
      }
    } catch (err) {
      console.error('Upload error:', err);
      showMessage('Erreur lors de l’envoi. Réessayez.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit} noValidate>
      <h3>Ajouter un document médical</h3>

      <label htmlFor="titre">Titre du document <span aria-hidden="true">*</span></label>
      <input
        id="titre"
        type="text"
        value={titre}
        onChange={e => setTitre(e.target.value)}
        required
        disabled={loading}
      />

      <label htmlFor="type">Type <span aria-hidden="true">*</span></label>
      <select
        id="type"
        value={typeDoc}
        onChange={e => setTypeDoc(e.target.value)}
        required
        disabled={loading}
      >
        <option value="">-- Sélectionner --</option>
        <option value="ordonnance">Ordonnance</option>
        <option value="examen">Examen</option>
        <option value="compte_rendu">Compte-rendu</option>
        <option value="autre">Autre</option>
      </select>

      <label htmlFor="categorie">Catégorie (optionnel)</label>
      <input
        id="categorie"
        type="text"
        value={categorie}
        onChange={e => setCategorie(e.target.value)}
        disabled={loading}
      />

      <label htmlFor="fichier">Fichier (PDF, image) <span aria-hidden="true">*</span></label>
      <input
        id="fichier"
        type="file"
        accept=".pdf,image/*"
        onChange={e => setFile(e.target.files[0])}
        required
        disabled={loading}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'En cours...' : 'Envoyer'}
      </button>

      {message.text && (
        <p className={message.type === 'error' ? 'error-message' : 'success-message'}>
          {message.text}
        </p>
      )}
    </form>
  );
}
