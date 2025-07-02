import { useState } from 'react';
import './Register.css';
import { registerUser } from '../services/authService';

export default function Register({ setPage }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    role: 'patient',
    email: '',
    firstname: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 3 && form.password !== form.confirmPassword) {
      alert("❌ Les mots de passe ne correspondent pas.");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { confirmPassword, ...payload } = form;
    const res = await registerUser(payload);
    if (res.user) {
      alert('✅ Inscription réussie !');
      setPage('login');
    } else {
      alert(res.message || res.error || '❌ Erreur');
    }
  };

  return (
    <div className="register-page">
      <div className="register-left">
        <div className="register-promo">
          <h1>Inscrivez-vous en toute confiance</h1>
          <blockquote>
            "Service rapide, sécurisé et très fluide. Bravo !"
            <footer>— Catherine R.</footer>
          </blockquote>
        </div>
      </div>

      <div className="register-right">
        <form
          className="register-form"
          onSubmit={step === 3 ? handleSubmit : handleNext}
        >
          {/* Étapes */}
          <div className="progress-bar">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`step ${step >= s ? 'active' : ''}`}>
                {s}
              </div>
            ))}
          </div>

          {/* Étape 1 */}
          {step === 1 && (
            <>
              <div className="role-toggle">
                <button
                  type="button"
                  className={form.role === 'patient' ? 'active' : ''}
                  onClick={() => setForm({ ...form, role: 'patient' })}
                >
                  Patient
                </button>
                <button
                  type="button"
                  className={form.role === 'medecin' ? 'active' : ''}
                  onClick={() => setForm({ ...form, role: 'medecin' })}
                >
                  Médecin
                </button>
              </div>
              <input
                name="email"
                type="email"
                placeholder="Adresse email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </>
          )}

          {/* Étape 2 */}
          {step === 2 && (
            <>
              <div className="name-row">
                <input
                  name="firstname"
                  placeholder="Prénom"
                  value={form.firstname}
                  onChange={handleChange}
                  required
                />
                <input
                  name="name"
                  placeholder="Nom"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <input
                name="phone"
                placeholder="Téléphone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </>
          )}

          {/* Étape 3 */}
          {step === 3 && (
            <>
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmer le mot de passe"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </>
          )}

          {/* Navigation */}
          <div className="button-group">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="secondary">
                Retour
              </button>
            )}
            <button type="submit">
              {step === 3 ? "S'inscrire" : 'Continuer'}
            </button>
          </div>

          {/* Lien vers login - toujours visible */}
          <p className="login-bottom">
            Déjà inscrit ?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => setPage('login')}
            >
              Se connecter
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
