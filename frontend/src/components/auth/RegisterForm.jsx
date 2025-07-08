// frontend/src/components/auth/RegisterForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: 'patient',
    email: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    sexe: '',
    mot_de_passe: '',
    confirmation: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.mot_de_passe !== formData.confirmation) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        alert('Compte créé avec succès ! Redirection...');
        navigate('/login');
      } else {
        setMessage(data.message || 'Erreur serveur');
      }
    } catch (error) {
      setMessage('Erreur réseau');
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Créer un compte</h2>

      {step === 1 && (
        <>
          <div className="role-select">
            <button
              type="button"
              className={formData.role === 'patient' ? 'active' : ''}
              onClick={() => setFormData((prev) => ({ ...prev, role: 'patient' }))}
            >
              Patient
            </button>
            <button
              type="button"
              className={formData.role === 'medecin' ? 'active' : ''}
              onClick={() => setFormData((prev) => ({ ...prev, role: 'medecin' }))}
            >
              Médecin
            </button>
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <button type="button" onClick={nextStep}>
            Continuer
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            required
            value={formData.nom}
            onChange={handleChange}
          />
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            required
            value={formData.prenom}
            onChange={handleChange}
          />
          <input
            type="date"
            name="date_naissance"
            required
            value={formData.date_naissance}
            onChange={handleChange}
          />
          <select
            name="sexe"
            required
            value={formData.sexe}
            onChange={handleChange}
          >
            <option value="">-- Sexe --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
            <option value="Autre">Autre</option>
          </select>
          <div className="form-nav">
            <button type="button" onClick={prevStep}>
              Retour
            </button>
            <button type="button" onClick={nextStep}>
              Suivant
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <input
            type="password"
            name="mot_de_passe"
            placeholder="Mot de passe"
            required
            value={formData.mot_de_passe}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmation"
            placeholder="Confirmer le mot de passe"
            required
            value={formData.confirmation}
            onChange={handleChange}
          />
          <div className="form-nav">
            <button type="button" onClick={prevStep}>
              Retour
            </button>
            <button type="submit">Créer mon compte</button>
          </div>
        </>
      )}

      {message && <p className="error">{message}</p>}
      <p className="login-link">
          Déjà un compte ?{' '}
        <button type="button" className="link-button"onClick={() => navigate('/auth/login')}>
          Se connecter
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;