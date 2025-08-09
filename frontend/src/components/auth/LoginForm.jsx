// frontend/components/LoginForm.jsx
import React, { useState,useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import { login } from '../../services/authService';
import { AuthContext } from '../../contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm = () => {
  console.log("📝 Formulaire de connexion chargé");
  
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDepasse] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginContext } = useContext(AuthContext); // Fonction loginContext du contexte
  
  console.log("📋 LoginForm - état initial:", { email, motDePasse, error, showPassword });

  // Récupérer la page de destination sauvegardée
  const from = location.state?.from?.pathname || '/dashboard';

const handleConnexion = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const data = await login({ email, mot_de_passe: motDePasse });
    
    console.log('🍪 Données de connexion reçues:', data);
    
    // Vérifier si le compte n'est pas vérifié
    if (data.requireVerification) {
      // Rediriger vers la page de saisie du code
      navigate('/auth/verify-code', { state: { email } });
      return;
    }
    
    // Avec les cookies, pas besoin de stocker le token
    // Le serveur définit automatiquement le cookie
    if (data.success && data.user) {
      loginContext(data.user); // Passer les données utilisateur au contexte
      navigate(from, { replace: true }); // Rediriger vers la page de destination sauvegardée
    } else {
      setError('Erreur de connexion');
    }
  } catch (err) {
    console.error('Erreur de connexion:', err);
    // Vérifier si l'erreur est liée à une vérification manquante
    if (err.verification === false) {
      navigate('/auth/verify-code', { state: { email } });
      return;
    }
    setError(err.message || 'Échec de la connexion');
  }
};

  return (
    <form className="login-form" onSubmit={handleConnexion}>
      <h2>Se connecter</h2>
      {error && <p className="error-message">{error}</p>}
      <label>Email</label>
      <input
        type="email"
        placeholder="email@exemple.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label>Mot de passe</label>
      <div className="password-input-container">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={motDePasse}
          onChange={(e) => setMotDepasse(e.target.value)}
          required
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <div className="options">
        <label>
          <input type="checkbox" /> Se souvenir de moi
        </label>
        <button 
          type="button" 
          className="link-button forgot-link" 
          onClick={() => navigate('/auth/forgot-password')}
        >
          Mot de passe oublié ?
        </button>
      </div>

      <button type="submit" className="login-button">Se connecter</button>

      <p className="register-link">
        Pas encore de compte ?{" "}
        <button type="button" className="link-button" onClick={() => navigate('/auth/register')}>
          S'inscrire
        </button>
      </p>
    </form>
  );
};

export default LoginForm;