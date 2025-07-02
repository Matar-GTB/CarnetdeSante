import { useState } from 'react'; // Pour gérer les états (email, password, message, etc.)
import { loginUser } from '../services/authService'; // Fonction d'appel à l'API pour se connecter
import './Login.css'; // Style CSS associé

// Composant principal de connexion
export default function Login({ setPage, setUser }) {
  // Formulaire : email et mot de passe
  const [form, setForm] = useState({ email: '', password: '' });

  // Message d'erreur ou succès
  const [message, setMessage] = useState('');

  // Mise à jour des champs du formulaire
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    const result = await loginUser(form); // Appelle l’API avec email + password

    if (result.token && result.user) {
      // ✅ Connexion réussie
      localStorage.setItem('token', result.token); // Stocke le token localement (auth future)
      setUser(result.user); // Stocke l'utilisateur connecté (affiché dans Dashboard)
      setPage('dashboard'); // Redirige vers la page d’accueil après connexion
    } else {
      // ❌ Échec de connexion
      setMessage(result.message || result.error || '❌ Identifiants incorrects');
    }
  };

  // Rendu JSX
  return (
    <div className="login-page">
      {/* Partie gauche avec promo */}
      <div className="login-left">
        <div className="login-promo">
          <h1>Pour vos études, <br /><strong>trouvez la colocation idéale</strong></h1>
          <blockquote>
            "Une vraie équipe de professionnels toujours à l’écoute du client.
            J’aime surtout leur réactivité. Je recommande à 100%."
            <footer>— Franck S.</footer>
          </blockquote>
        </div>
      </div>

      {/* Partie droite avec le formulaire */}
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Se connecter</h2>

          {/* Champ email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          {/* Champ mot de passe */}
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* Lien mot de passe oublié + checkbox */}
          <div className="login-links">
            <label><input type="checkbox" /> Se souvenir de moi</label>
            <a href="#">Mot de passe oublié ?</a>
          </div>

          {/* Bouton envoyer */}
          <button type="submit">Se connecter</button>

          {/* Lien vers page d’inscription */}
          <p className="login-bottom">
            Vous n'avez pas de compte ?{' '}
            <button
              onClick={() => setPage('register')}
              type="button"
              className="link-button"
            >
              S'inscrire
            </button>
          </p>

          {/* Message d’erreur ou de succès */}
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
}
