import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Layout from './layout/Layout';

export default function ProtectedRoute({ children, allowedRoles, withoutLayout = false }) {
  const location = useLocation();
  const { isAuthenticated, user } = useContext(AuthContext);

  // Rediriger vers login si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Vérifier les rôles autorisés si spécifiés
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si withoutLayout est true, retourner directement les enfants sans Layout
  if (withoutLayout) {
    return children;
  }
  
  // Par défaut, envelopper dans Layout avec Navbar
  return (
    <Layout>
      {children}
    </Layout>
  );
}