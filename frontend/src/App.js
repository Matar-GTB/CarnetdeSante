import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NotFound from './pages/NotFound';
import Logout from './components/auth/Logout';
import DocumentsPage from './pages/medical/DocumentsPage';
import PartagePage from './pages/medical/PartagePage';
import PartageLienPublic from './pages/medical/PartageLienPublic'; 
import { getTokenPayload } from './utils/tokenUtils'; // Fonction utilitaire pour décoder le token
import VaccinationsPage from './pages/medical/VaccinationsPage';
import MesPatients from './pages/medecin/MesPatients';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = getTokenPayload(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        setIsAuthenticated(true);
        setRole(payload.role);
      } else {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
  };

  return (
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute> <DashboardPage role={role} /> </ProtectedRoute>}/>
        <Route path="/patients" element={ <ProtectedRoute> <MesPatients /> </ProtectedRoute>}/>
        <Route path="/vaccinations" element={<ProtectedRoute> <VaccinationsPage /> </ProtectedRoute> }/>
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/partage/:token" element={<PartageLienPublic />}/>
        <Route path="/partage" element={<PartagePage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
      
  );
}

export default App;