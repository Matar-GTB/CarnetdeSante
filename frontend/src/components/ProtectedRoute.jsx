import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  
  const { token } = useContext(AuthContext);
 if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}