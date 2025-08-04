// frontend/src/components/auth/Logout.jsx
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../ui/Loader';
import { AuthContext } from '../../contexts/AuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        console.log('🍪 Déconnexion terminée');
        
        // Attendre un peu pour afficher le message
        setTimeout(() => {
          navigate('/auth/login');
        }, 1000);
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        // Rediriger même en cas d'erreur
        navigate('/auth/login');
      }
    };

    performLogout();
  }, [logout, navigate]);

  return <Loader message="Déconnexion en cours..." />;
};

export default Logout;
