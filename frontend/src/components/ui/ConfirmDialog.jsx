// src/components/ui/ConfirmDialog.jsx
import React from 'react';
import './ConfirmDialog.css';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-backdrop">
      <div className="confirm-dialog">
        <p>{message}</p>
        <div className="confirm-buttons">
          <button onClick={onCancel}>Annuler</button>
          <button onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}
