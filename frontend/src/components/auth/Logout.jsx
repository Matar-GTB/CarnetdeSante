// frontend/src/pages/auth/Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/ui/Loader'; // adapte le chemin si besoin

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // ou ajuster selon ton projet
      navigate('/auth/login');
    }, 1000); // pause pour afficher le loader
  }, [navigate]);

  return <Loader message="Déconnexion en cours..." />;
};

export default Logout;
