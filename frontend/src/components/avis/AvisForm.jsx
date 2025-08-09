import React, { useState, useEffect, useContext } from 'react';
import { laisserAvis, getAvisPatientPourMedecin } from '../../services/avisService';
import { AuthContext } from '../../contexts/AuthContext';
import './AvisForm.css';

const AvisForm = ({ medecinId, medecinNom, onAvisSubmitted, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    note: 5,
    commentaire: '',
    anonyme: false
  });
  const [loading, setLoading] = useState(false);
  const [avisExistant, setAvisExistant] = useState(null);

  useEffect(() => {
    // Vérifier si le patient a déjà laissé un avis
    const checkAvisExistant = async () => {
      try {
        const avis = await getAvisPatientPourMedecin(medecinId);
        if (avis) {
          setAvisExistant(avis);
          setFormData({
            note: avis.note,
            commentaire: avis.commentaire || '',
            anonyme: avis.anonyme || false
          });
        }
      } catch (error) {
        console.error('Erreur vérification avis existant:', error);
      }
    };

    if (user.role === 'patient') {
      checkAvisExistant();
    }
  }, [medecinId, user.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.note) {
      alert('Veuillez donner une note');
      return;
    }

    setLoading(true);
    try {
      await laisserAvis({
        medecin_id: medecinId,
        ...formData
      });
      
      alert(avisExistant ? 'Avis mis à jour avec succès !' : 'Avis ajouté avec succès !');
      
      if (onAvisSubmitted) {
        onAvisSubmitted();
      }
    } catch (error) {
      console.error('Erreur soumission avis:', error);
      alert('Erreur lors de la soumission de l\'avis');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="rating-input">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= formData.note ? 'active' : ''}`}
            onClick={() => setFormData({...formData, note: star})}
          >
            ★
          </button>
        ))}
        <span className="rating-text">({formData.note}/5)</span>
      </div>
    );
  };

  if (user.role !== 'patient') {
    return (
      <div className="avis-form-error">
        <p>Seuls les patients peuvent laisser des avis.</p>
      </div>
    );
  }

  return (
    <div className="avis-form-overlay">
      <div className="avis-form">
        <h3>
          {avisExistant ? 'Modifier votre avis' : 'Laisser un avis'} sur Dr {medecinNom}
        </h3>
        
        <div className="avis-instructions">
          <p><strong>Comment ça marche ?</strong></p>
          <ol>
            <li>Donnez une note en cliquant sur les étoiles (de 1 à 5)</li>
            <li>Écrivez un commentaire (facultatif)</li>
            <li>Choisissez si vous souhaitez rester anonyme</li>
            <li>Cliquez sur "{avisExistant ? 'Mettre à jour' : 'Publier l\'avis'}"</li>
          </ol>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Note : <span className="required">*</span></label>
            {renderStars()}
            <small className="form-help">Cliquez sur les étoiles pour attribuer une note</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="commentaire">Commentaire (optionnel) :</label>
            <textarea
              id="commentaire"
              value={formData.commentaire}
              onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
              placeholder="Partagez votre expérience avec ce médecin (ponctualité, écoute, explications...)"
              rows={4}
            />
            <small className="form-help">Votre commentaire aide les autres patients dans leur choix</small>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.anonyme}
                onChange={(e) => setFormData({...formData, anonyme: e.target.checked})}
              />
              Laisser cet avis de manière anonyme
            </label>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Envoi...' : (avisExistant ? 'Mettre à jour' : 'Publier l\'avis')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvisForm;
