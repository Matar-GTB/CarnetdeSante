// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute              from './components/ProtectedRoute';
import LoginPage                   from './pages/auth/LoginPage';
import RegisterPage                from './pages/auth/RegisterPage';
import Dashboard                   from './pages/dashboard/Dashboard';
import NotFound                    from './pages/NotFound';
import Logout                      from './components/auth/Logout';
import DocumentsPage               from './pages/medical/DocumentsPage';
import PartagePage                 from './pages/medical/PartagePage';
import PartageLienPublic           from './pages/medical/PartageLienPublic';
import VaccinationsPage            from './pages/medical/VaccinationsPage';
import MyPatientsPageLegacy       from './pages/medecin/MyPatientsPage';
import AccountSettings             from './pages/Settings/AccountSettings';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import ConsultationsPage           from './pages/Consultations/ConsultationsPage';
import RappelsPage                 from './pages/rappels/RappelsPage';
import NotificationsPage           from './pages/notifications/NotificationsPage';
import NotificationSettings        from './pages/Settings/NotificationSettings';
import AppointmentWithMedecinPage  from './pages/appointments/AppointmentWithMedecinPage';
// import DisponibilitesPage          from './pages/medecin/DisponibilitesPage';
import MedicationsPage             from './pages/medications/MedicationsPage';
import MedicationForm              from './pages/medications/MedicationForm';

// Import des nouveaux composants de profils
import PatientProfilePrive         from './pages/Profile/PatientProfilePrive';
import MedecinProfilePrive         from './pages/Profile/MedecinProfilePrive';
import EmergencyProfile            from './components/profile/EmergencyProfile';
import MedecinProfilePublic        from './pages/Profile/MedecinProfilePublic';
import PatientProfilePublic        from './pages/Profile/PatientProfilePublic';
import MedecinRequestsPage         from './pages/medecin/MedecinRequestsPage';
import MyPatientsPage              from './pages/medecin/MyPatientsPage';
import TraitantManagementPage      from './pages/patient/TraitantManagementPage';
import UserMenu                from './components/layout/UserMenu';
import MessagingInterface      from './components/Messaging/MessagingInterface';



export default function App() {
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
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
<Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
      {/* Rendez-vous */}
      <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
      <Route path="/consultations" element={<ProtectedRoute><ConsultationsPage /></ProtectedRoute>} />
      <Route path="/appointments/with/:medecinId" element={<ProtectedRoute><AppointmentWithMedecinPage /></ProtectedRoute>} />

      {/* Rappel */}
       
        <Route path="/rappels" element={<ProtectedRoute><RappelsPage /></ProtectedRoute>} />

      {/* Messagerie */}
      <Route path="/messages" element={<ProtectedRoute><MessagingInterface /></ProtectedRoute>} />

<Route path="/medications" element={<ProtectedRoute><MedicationsPage /></ProtectedRoute>} />
<Route
  path="/medications/create"
  element={
    <ProtectedRoute>
      <MedicationForm />
    </ProtectedRoute>
  }
/>
<Route
  path="/medications/edit/:id"
  element={
    <ProtectedRoute>
      <MedicationForm />
    </ProtectedRoute>
  }
/>
      {/* Médecin - redirection vers la nouvelle page */}
      <Route path="/patients" element={<ProtectedRoute allowedRoles={['medecin']}><MyPatientsPageLegacy /></ProtectedRoute>} />

      {/* Autres pages patient */}
      <Route path="/vaccinations" element={<ProtectedRoute><VaccinationsPage /></ProtectedRoute>} />
      <Route path="/documents"    element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
      <Route path="/partage"      element={<ProtectedRoute><PartagePage /></ProtectedRoute>} />

      {/* Partage public (sans auth) */}
      <Route path="/partage/:token" element={<PartageLienPublic />} />

      {/* Profil & settings - redirection vers les nouveaux profils */}
      <Route path="/profile" element={<Navigate to="/profile/private" replace />} />
      
      {/* Nouveaux profils granulaires */}
      <Route path="/profile/private" element={<ProtectedRoute><PatientProfilePrive /></ProtectedRoute>} />
      <Route path="/profile/medecin" element={<ProtectedRoute allowedRoles={['medecin']}><MedecinProfilePrive /></ProtectedRoute>} />
      <Route path="/profile/emergency/:token" element={<EmergencyProfile />} />
      
      {/* Gestion des relations patient-médecin */}
      <Route path="/my-patients" element={<ProtectedRoute allowedRoles={['medecin']}><MyPatientsPage /></ProtectedRoute>} />
      <Route path="/traitants" element={<ProtectedRoute allowedRoles={['patient']}><TraitantManagementPage /></ProtectedRoute>} />
      <Route path="/requests/received" element={<ProtectedRoute allowedRoles={['medecin']}><MedecinRequestsPage /></ProtectedRoute>} />
      
      <Route path="/settings/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
{/* Disponibilités médecin - à implémenter */}
{/*
<Route
  path="/disponibilites"
  element={
    <ProtectedRoute allowedRoles={['medecin']}>
      <DisponibilitesPage />
    </ProtectedRoute>
  }
/>
*/}

  {/* Routes publiques */}
  <Route path="/doctors/:id/public" element={<MedecinProfilePublic />} />
  <Route path="/patients/:id/public" element={<PatientProfilePublic />} />
  
  {/* Demo page for UserMenu */}
  <Route path="/usermenu" element={<UserMenu />} />

      {/* Logout */}
      <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
