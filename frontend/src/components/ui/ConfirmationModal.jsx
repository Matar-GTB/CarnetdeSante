// src/components/ui/ConfirmationModal.jsx
import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ visible, onClose, onConfirm, message }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirmation</h3>
        <p>{message || "Voulez-vous vraiment continuer ?"}</p>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button className="btn-confirm" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
