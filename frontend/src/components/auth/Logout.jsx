// frontend/src/pages/auth/Logout.jsx
import {  useContext,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/ui/Loader'; // adapte le chemin si besoin
import { AuthContext } from '../../contexts/AuthContext';
const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);


  useEffect(() => {
    setTimeout(() => {
      logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // ou ajuster selon ton projet
      navigate('/auth/login');
    }, 1000); // pause pour afficher le loader
  }, [logout,navigate]);

  return <Loader message="Déconnexion en cours..." />;
};

export default Logout;
