import React, { useState } from 'react';
import './UploadForm.css';
import { uploadDocument } from '../../services/documentService';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [titre, setTitre] = useState('');
  const [type, setType] = useState('');
  const [categorie, setCategorie] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !titre || !type) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('type_document', type);
    formData.append('categorie', categorie);
    formData.append('fichier', file);

    try {
      await uploadDocument(formData);
      setSuccess('Document téléversé avec succès ✅');
      setError('');
      setFile(null);
      setTitre('');
      setType('');
      setCategorie('');
      window.location.reload(); // recharge la liste
    } catch (err) {
      setError("Erreur lors de l’envoi. Réessayez.");
      setSuccess('');
    }
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <h3>📤 Ajouter un document médical</h3>

      <label>Titre du document *</label>
      <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} required />

      <label>Type *</label>
      <select value={type} onChange={(e) => setType(e.target.value)} required>
        <option value="">-- Sélectionner --</option>
        <option value="ordonnance">Ordonnance</option>
        <option value="examen">Examen</option>
        <option value="compte_rendu">Compte-rendu</option>
        <option value="autre">Autre</option>
      </select>

      <label>Catégorie (optionnel)</label>
      <input type="text" value={categorie} onChange={(e) => setCategorie(e.target.value)} />

      <label>Fichier (PDF, image) *</label>
      <input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files[0])} required />

      <button type="submit">Envoyer</button>

      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}
    </form>
  );
};

export default UploadForm;
