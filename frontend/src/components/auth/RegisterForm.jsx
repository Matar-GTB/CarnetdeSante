import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { register } from '../../services/authService';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { FaEye, FaEyeSlash, FaEnvelope, FaSms } from 'react-icons/fa';
import { isValidPhoneNumber as isValidPhoneLib } from 'libphonenumber-js';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // État de chargement
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    telephone: '',
    sexe: '',
    mot_de_passe: '',
    confirmation: '',
    preferred_verification: 'email', // Par défaut, vérification par email
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage('');
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isStrongPassword = (pwd) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}[\]:;<>,.?~\\/-]{8,}$/.test(pwd);
  
  // Validation universelle du téléphone avec libphonenumber-js
  const isValidPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return false;
    try {
      // Utiliser la fonction de la bibliothèque directement
      return isValidPhoneLib('+' + phoneNumber);
    } catch (error) {
      // Si le parsing échoue, validation basique
      return phoneNumber.length >= 8 && phoneNumber.length <= 15;
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.role) return setMessage('Veuillez choisir un rôle');
      if (!formData.email) return setMessage('Email requis');
      if (!isValidEmail(formData.email)) return setMessage("Format d'email invalide");
    }
    if (step === 2) {
      const { nom, prenom, date_naissance, sexe, telephone } = formData;
      if (!nom || !prenom || !date_naissance || !sexe) {
        return setMessage('Tous les champs sont obligatoires');
      }
      if (!telephone) {
        return setMessage('Numéro de téléphone requis');
      }
      // Validation universelle avec libphonenumber-js
      if (!isValidPhoneNumber(telephone)) {
        return setMessage('Format de téléphone invalide pour ce pays');
      }
    }
    setMessage('');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { mot_de_passe, confirmation, email } = formData;

    if (!mot_de_passe || !confirmation) return setMessage('Mot de passe requis');
    if (mot_de_passe !== confirmation) return setMessage('Les mots de passe ne correspondent pas');
    if (!isStrongPassword(mot_de_passe)) {
      return setMessage("Mot de passe trop faible (8+ caractères, 1 majuscule, 1 chiffre, 1 spécial)");
    }

    try {
      // Commencer le chargement et effacer les messages
      setIsSubmitting(true);
      setMessage('');
      
      const response = await register(formData);
      
      // Vérifier si l'inscription est réussie avant de naviguer
      if (response.success) {
        // Redirection directe vers la page de vérification du code
        navigate('/auth/verify-code', { state: { email } });
      } else {
        setMessage(response.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setMessage(err.message || 'Erreur serveur');
    } finally {
      setIsSubmitting(false);
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
            country={'bf'} // Burkina Faso par défaut pour tester
            value={formData.telephone}
            onChange={(phone) => setFormData((prev) => ({ ...prev, telephone: phone }))}
            inputProps={{ 
              name: 'telephone', 
              required: true,
              placeholder: 'Numéro de téléphone'
            }}
            containerClass="phone-container"
            inputClass="phone-input"
            buttonClass="phone-button"
            enableSearch={true}
            countryCodeEditable={false}
            // Formatage personnalisé pour affichage plus compact
            masks={{
              'bf': '.. .. .. ..', // Burkina Faso: XX XX XX XX (8 chiffres)
              'ci': '.. .. .. .. ..', // Côte d'Ivoire: XX XX XX XX XX (10 chiffres)
              'tg': '.. .. .. ..', // Togo: XX XX XX XX (8 chiffres)
              'sn': '.. .. .. ..', // Sénégal: XX XX XX XX (8 chiffres)
              'ml': '.. .. .. ..', // Mali: XX XX XX XX (8 chiffres)
              'ne': '.. .. .. ..', // Niger: XX XX XX XX (8 chiffres)
              'gn': '... .. .. ..', // Guinée: XXX XX XX XX (9 chiffres)
              'fr': '. .. .. .. ..', // France: X XX XX XX XX (9 chiffres)
            }}
            // TOUS les pays du monde sont disponibles par défaut
            preferredCountries={[
              'bf', 'ci', 'tg', 'sn', 'ml', 'ne', 'gn', 'fr', 'ma', 'dz', 'tn', 
              'ng', 'gh', 'cm', 'ke', 'za', 'eg', 'be', 'ca', 'us', 'gb', 'de'
            ]}
            specialLabel="Téléphone (format international)"
            searchPlaceholder="Rechercher un pays..."
            disableDropdown={false}
            autoFormat={true}
          />
          
          <div className="verification-preference">
            <p>Comment préférez-vous vérifier votre compte ?</p>
            <div className="verification-options">
              <label className={`verification-option ${formData.preferred_verification === 'email' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="preferred_verification"
                  value="email"
                  checked={formData.preferred_verification === 'email'}
                  onChange={() => setFormData(prev => ({ ...prev, preferred_verification: 'email' }))}
                />
                <span className="option-icon"><FaEnvelope /></span>
                <span className="option-text">Email</span>
              </label>
              
              <label className={`verification-option ${formData.preferred_verification === 'sms' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="preferred_verification"
                  value="sms"
                  checked={formData.preferred_verification === 'sms'}
                  onChange={() => setFormData(prev => ({ ...prev, preferred_verification: 'sms' }))}
                />
                <span className="option-icon"><FaSms /></span>
                <span className="option-text">SMS</span>
              </label>
            </div>
          </div>

          <div className="form-nav">
            <button type="button" onClick={prevStep}>Retour</button>
            <button type="button" onClick={nextStep}>Suivant</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="password-input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="mot_de_passe"
              placeholder="Mot de passe"
              value={formData.mot_de_passe}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          <div className="password-input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmation"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmation}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          <div className="form-nav">
            <button type="button" onClick={prevStep} disabled={isSubmitting}>Retour</button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
            </button>
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
