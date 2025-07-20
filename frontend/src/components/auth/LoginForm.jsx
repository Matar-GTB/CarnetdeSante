// frontend/components/LoginForm.jsx
import React, { useState,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { login } from '../../services/authService';
import { AuthContext } from '../../contexts/AuthContext';
const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDepasse] = useState('');
  const [error, setError] = useState('');
 const [showPassword, setShowPassword] = useState(false); // 👁️ état pour afficher/masquer
const { loginContext } = useContext(AuthContext); // la fonction définie dans ton contexte

const handleConnexion = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const data = await login({ email, mot_de_passe: motDePasse });

      loginContext(data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Échec de la connexion');
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
      <input
        type={showPassword ? 'text' : 'password'} //  affichage conditionnel
        placeholder="••••••••"
        value={motDePasse}
        onChange={(e) => setMotDepasse(e.target.value)}
        required
      />

      <div className="options">
        <label>
          <input type="checkbox" /> Se souvenir de moi
        </label>
        <label>
          <input
            type="checkbox"
            onChange={() => setShowPassword((prev) => !prev)}
          /> Afficher le mot de passe
        </label>
        <a href="/reset-password" className="forgot-link">Mot de passe oublié ?</a>
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