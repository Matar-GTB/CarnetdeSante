import React, { useState } from 'react';
import './AccountSettings.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
const AccountSettings = ({ token }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await axios.put(
        '/api/users/password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Mot de passe mis à jour avec succès.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert("Erreur lors de la mise à jour du mot de passe.");
    }
  };
<Link to="/profile" className="back-link">← Retour au profil</Link>
  return (
    <form className="account-settings" onSubmit={handleSubmit}>
      <h2>Modifier le mot de passe</h2>

      <label>Mot de passe actuel
        <input
          type="password"
          name="currentPassword"
          value={passwordData.currentPassword}
          onChange={handleChange}
          required
        />
      </label>

      <label>Nouveau mot de passe
        <input
          type="password"
          name="newPassword"
          value={passwordData.newPassword}
          onChange={handleChange}
          required
        />
      </label>

      <label>Confirmer le nouveau mot de passe
        <input
          type="password"
          name="confirmPassword"
          value={passwordData.confirmPassword}
          onChange={handleChange}
          required
        />
      </label>

      <button type="submit">Changer le mot de passe</button>
    </form>
  );
};

export default AccountSettings;
