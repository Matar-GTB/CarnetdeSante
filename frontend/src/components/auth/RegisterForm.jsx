import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { register } from '../../services/authService';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    telephone: '',
    sexe: '',
    mot_de_passe: '',
    confirmation: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage('');
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isStrongPassword = (pwd) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/.test(pwd);

  const nextStep = () => {
    if (step === 1) {
      if (!formData.role) return setMessage('Veuillez choisir un rôle');
      if (!formData.email) return setMessage('Email requis');
      if (!isValidEmail(formData.email)) return setMessage("Format d'email invalide");
    }
    if (step === 2) {
      const { nom, prenom, date_naissance, sexe, telephone } = formData;
      if (!nom || !prenom || !date_naissance || !sexe || !telephone) {
        return setMessage('Tous les champs sont obligatoires');
      }
    }
    setMessage('');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { mot_de_passe, confirmation } = formData;

    if (!mot_de_passe || !confirmation) return setMessage('Mot de passe requis');
    if (mot_de_passe !== confirmation) return setMessage('Les mots de passe ne correspondent pas');
    if (!isStrongPassword(mot_de_passe)) {
      return setMessage("Mot de passe trop faible (8+ caractères, 1 majuscule, 1 chiffre, 1 spécial)");
    }

    try {
      await register(formData);
      alert('✅ Compte créé avec succès !');
      navigate('/auth/login');
    } catch (err) {
      setMessage(err.message || 'Erreur serveur');
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="step-indicator">
        {['1', '2', '3'].map((n, i) => (
          <span key={n} className={step === i + 1 ? 'active-step' : ''}>{n}</span>
        ))}
      </div>

      <h2>
        {step === 1 && 'Création de compte'}
        {step === 2 && 'Informations personnelles'}
        {step === 3 && 'Sécurité du compte'}
      </h2>

      {step === 1 && (
        <>
          <div className="role-select">
            <button
              type="button"
              className={formData.role === 'patient' ? 'active' : ''}
              onClick={() => setFormData((prev) => ({ ...prev, role: 'patient' }))}
            >Patient</button>
            <button
              type="button"
              className={formData.role === 'medecin' ? 'active' : ''}
              onClick={() => setFormData((prev) => ({ ...prev, role: 'medecin' }))}
            >Médecin</button>
          </div>

          <input
            type="email"
            name="email"
            placeholder="Adresse e-mail"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <button type="button" onClick={nextStep}>Continuer</button>
        </>
      )}

      {step === 2 && (
        <>
          <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
          <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required />
          <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required />
          <select name="sexe" value={formData.sexe} onChange={handleChange} required>
            <option value="">-- Sexe --</option>
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
            <option value="autre">Autre</option>
          </select>

          <PhoneInput
            value={formData.telephone}
            onChange={(phone) => setFormData((prev) => ({ ...prev, telephone: phone }))}
            inputProps={{ name: 'telephone', required: true }}
            containerClass="phone-container"
            inputClass="phone-input"
            buttonClass="phone-button"
            enableSearch
            preferredCountries={['fr', 'bf', 'us', 'gb']}
          />


          <div className="form-nav">
            <button type="button" onClick={prevStep}>Retour</button>
            <button type="button" onClick={nextStep}>Suivant</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <input
            type={showPassword ? 'text' : 'password'}
            name="mot_de_passe"
            placeholder="Mot de passe"
            value={formData.mot_de_passe}
            onChange={handleChange}
            required
          />
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmation"
            placeholder="Confirmer le mot de passe"
            value={formData.confirmation}
            onChange={handleChange}
            required
          />
          <label>
            <input type="checkbox" onChange={() => setShowPassword(!showPassword)} /> Afficher le mot de passe
          </label>
          <div className="form-nav">
            <button type="button" onClick={prevStep}>Retour</button>
            <button type="submit">Créer mon compte</button>
          </div>
        </>
      )}

      {message && <p className="error">{message}</p>}

      <p className="login-link">
  Déjà inscrit ? <span className="link-text" onClick={() => navigate('/auth/login')}>Se connecter</span>
</p>

    </form>
  );
};

export default RegisterForm;
