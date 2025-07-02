import { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null); // utile pour passer les infos
   // 🔧 TEST : on démarre directement sur le Dashboard (pas besoin de se connecter)
  /*const [page, setPage] = useState('dashboard');

  // 🔧 Données fictives pour simuler un utilisateur connecté
  const [user, setUser] = useState({
    firstname: 'Brice',
    email: 'brice@email.com',
    phone: '06 00 00 00 00',
    role: 'patient'
  });*/
  return (
    <div className="app-container">
      <nav>
        <button onClick={() => setPage('register')}>Inscription</button>
        <button onClick={() => setPage('login')}>Connexion</button>
         {/* Ce bouton permet de revenir au Dashboard manuellement Bouton toujours visible */}
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        {/*user && <button onClick={() => setPage('dashboard')}>Tableau de bord</button>*/}
      </nav>
      <hr />

      {/* Affichage conditionnel selon la page */}
      {page === 'register' && <Register setPage={setPage} />}
      {page === 'login' && <Login setPage={setPage} setUser={setUser} />}
      {page === 'dashboard' && <Dashboard user={user} />}
    </div>
  );
}

export default App;
