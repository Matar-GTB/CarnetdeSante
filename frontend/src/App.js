// src/App.jsx
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext }             from './contexts/AuthContext';
import LoginPage                   from './pages/auth/LoginPage';
import RegisterPage                from './pages/auth/RegisterPage';
import DashboardPage               from './pages/dashboard/DashboardPage';
import NotFound                    from './pages/NotFound';
import Logout                      from './components/auth/Logout';
import DocumentsPage               from './pages/medical/DocumentsPage';
import PartagePage                 from './pages/medical/PartagePage';
import PartageLienPublic           from './pages/medical/PartageLienPublic';
import VaccinationsPage            from './pages/medical/VaccinationsPage';
import MesPatients                 from './pages/medecin/MesPatients';
import ProfilePage                 from './pages/Profile/ProfilePage';
import AccountSettings             from './pages/Settings/AccountSettings';
import AppointmentsPage            from './pages/appointments/AppointmentsPage';
import ConsultationsPage           from './pages/Consultations/ConsultationsPage';
import RequestTraitantPage         from './pages/medecinTraitant/RequestTraitantPage';
import RappelsPage from './pages/rappels/RappelsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import NotificationSettings from './pages/Settings/NotificationSettings';
import MedicationForm from './pages/medications/MedicationForm';
import MedecinProfilePublicPage from './pages/Profile/MedecinProfilePublicPage';
import AppointmentWithMedecinPage from './pages/appointments/AppointmentWithMedecinPage';
import DisponibilitesPage from './pages/medecin/DisponibilitesPage';



export default function App() {
  const { token, role } = useContext(AuthContext);
  const isAuthenticated = Boolean(token);

  const ProtectedRoute = ({ children }) =>
    isAuthenticated ? children : <Navigate to="/auth/login" replace />;

  return (
    <Routes>
      {/* Auth public */}
      <Route path="/auth/login"    element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Racine → dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage role={role} />
          </ProtectedRoute>
        }
      />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
<Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
      {/* Rendez-vous */}
      <Route path="/rendezvous" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
      <Route path="/consultations" element={<ProtectedRoute><ConsultationsPage /></ProtectedRoute>} />
      <Route path="/traitant/request" element={<ProtectedRoute><RequestTraitantPage /></ProtectedRoute>} />
        <Route path="/appointments/with/:medecinId" element={<ProtectedRoute><AppointmentWithMedecinPage /></ProtectedRoute>} />

      {/* Rappel */}
       
        <Route path="/rappels" element={<ProtectedRoute><RappelsPage /></ProtectedRoute>} />
<Route
  path="/medications"
  element={
    <ProtectedRoute>
      <MedicationForm />
    </ProtectedRoute>
  }
/>

      {/* Médecin */}
      <Route path="/patients" element={<ProtectedRoute><MesPatients /></ProtectedRoute>} />

      {/* Autres pages patient */}
      <Route path="/vaccinations" element={<ProtectedRoute><VaccinationsPage /></ProtectedRoute>} />
      <Route path="/documents"    element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
      <Route path="/partage"      element={<ProtectedRoute><PartagePage /></ProtectedRoute>} />

      {/* Partage public (sans auth) */}
      <Route path="/partage/:token" element={<PartageLienPublic />} />

      {/* Profil & settings */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/settings/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
<Route
  path="/disponibilites"
  element={
    <ProtectedRoute allowedRoles={['medecin']}>
      <DisponibilitesPage />
    </ProtectedRoute>
  }
/>
  {/* autres routes */}
  <Route path="/doctors/:id/public" element={<MedecinProfilePublicPage />} />

      {/* Logout */}
      <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
