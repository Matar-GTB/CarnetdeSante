
// src/App.jsx
import React, { useEffect, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Log global d'initialisation
import { AuthContext } from './contexts/AuthContext';
import ProtectedRoute              from './components/ProtectedRoute';
import LoginPage                   from './pages/auth/LoginPage';
import RegisterPage                from './pages/auth/RegisterPage';
import VerificationPendingPage     from './pages/auth/VerificationPendingPage';
import VerifyCodePage              from './pages/auth/VerifyCodePage';
import VerifyEmailPage             from './pages/auth/VerifyEmailPage';
import VerifySmsPage               from './pages/auth/VerifySmsPage';
import ForgotPasswordPage          from './pages/ForgotPasswordPage';
import ResetPasswordPage           from './pages/ResetPasswordPage';
import Dashboard                   from './pages/dashboard/Dashboard';
import NotFound                    from './pages/NotFound';
import Logout                      from './components/auth/Logout';
import DocumentsPage               from './pages/medical/DocumentsPage';
import PartagePage                 from './pages/medical/PartagePage';
import PartageLienPublic           from './pages/medical/PartageLienPublic';
import VaccinationsPage            from './pages/medical/VaccinationsPage';
import AccountSettings             from './pages/Settings/AccountSettings';
import AppointmentsPage            from './pages/appointments/AppointmentsPage';
import ConsultationsPage           from './pages/Consultations/ConsultationsPage';
import RappelsPage                 from './pages/rappels/RappelsPage';
import NotificationsPage           from './pages/notifications/NotificationsPage';
import NotificationSettings        from './pages/Settings/NotificationSettings';
import AppointmentWithMedecinPage  from './pages/appointments/AppointmentWithMedecinPage';
import MedicationsPage             from './pages/medications/MedicationsPage';
import MedicationForm              from './pages/medications/MedicationForm';
import CarnetSante                 from './pages/CarnetSante';
import ConsultationDetails         from './pages/medecin/ConsultationDetails';
import PlanningPage                from './pages/medecin/PlanningPage';
import PatientProfilePrive         from './pages/Profile/PatientProfilePrive';
import MedecinProfilePrive         from './pages/Profile/MedecinProfilePrive';
import EmergencyProfile            from './components/profile/EmergencyProfile';
import MedecinProfilePublic        from './pages/Profile/MedecinProfilePublic';
import PatientProfilePublic        from './pages/Profile/PatientProfilePublic';
import MedecinRequestsPage         from './pages/medecin/MedecinRequestsPage';
import MyPatientsPage              from './pages/medecin/MyPatientsPage';
import TraitantManagementPage      from './pages/patient/TraitantManagementPage';
import UserMenu                    from './components/layout/UserMenu';
import MessagingInterface          from './components/Messaging/MessagingInterface';

console.log('🚀 INITIALISATION DE APP.JS');
// Débuguer les imports
console.log('Chargement de App.js');
console.log({
  VerifyCodePage,
  VerifyEmailPage,
  VerifySmsPage,
  ForgotPasswordPage,
  Dashboard,
  AccountSettings,
});
console.log('Type de VerifyCodePage:', typeof VerifyCodePage);
console.log('VerificationPendingPage importé:', VerificationPendingPage);
console.log('VerifyCodePage importé:', VerifyCodePage);
console.log('VerifyEmailPage importé:', VerifyEmailPage);
console.log('VerifySmsPage importé:', VerifySmsPage);
console.log('ForgotPasswordPage importé:', ForgotPasswordPage);
console.log('Dashboard importé:', Dashboard);
console.log('AccountSettings importé:', AccountSettings);
console.log('AppointmentsPage importé:', AppointmentsPage);
console.log('ConsultationsPage importé:', ConsultationsPage);
console.log('RappelsPage importé:', RappelsPage);
console.log('NotificationsPage importé:', NotificationsPage);
console.log('NotificationSettings importé:', NotificationSettings);
console.log('PatientProfilePrive importé:', PatientProfilePrive);
console.log('MedecinProfilePrive importé:', MedecinProfilePrive);
console.log('EmergencyProfile importé:', EmergencyProfile);
console.log('MedecinProfilePublic importé:', MedecinProfilePublic);
console.log('PatientProfilePublic importé:', PatientProfilePublic);
console.log('MedecinRequestsPage importé:', MedecinRequestsPage);
console.log('MyPatientsPage importé:', MyPatientsPage);
console.log('TraitantManagementPage importé:', TraitantManagementPage);
console.log('UserMenu importé:', UserMenu);
console.log('MessagingInterface importé:', MessagingInterface);
console.log('CarnetSante importé:', CarnetSante);
console.log('DocumentsPage importé:', DocumentsPage);
console.log('PartagePage importé:', PartagePage);
console.log('PartageLienPublic importé:', PartageLienPublic);
console.log('VaccinationsPage importé:', VaccinationsPage);
console.log('AppointmentWithMedecinPage importé:', AppointmentWithMedecinPage);
console.log('MedicationForm importé:', MedicationForm);
console.log('ConsultationDetails importé:', ConsultationDetails);
console.log('PlanningPage importé:', PlanningPage);
console.log('LoginPage importé:', LoginPage);




export default function App() {
  const { user } = useContext(AuthContext);
  
  // État pour suivre les erreurs d'import
  const importStatus = {
    VerifyCodePage: typeof VerifyCodePage,
    VerifyEmailPage: typeof VerifyEmailPage,
    VerifySmsPage: typeof VerifySmsPage,
    LoginPage: typeof LoginPage,
    RegisterPage: typeof RegisterPage
  };
  
  const hasImportErrors = Object.entries(importStatus).some(([_, type]) => type !== 'function');

  useEffect(() => {
    if (!user) return;
    const socket = io('http://localhost:5000', { auth: { token: user.token } });
    socket.emit('join', user.id);

    // Nettoyage à la déconnexion
    return () => socket.disconnect();
  }, [user]);

  // Si nous avons des erreurs d'import, les afficher avant les routes
  if (hasImportErrors) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffdddd', border: '2px solid #ff0000', margin: '20px', borderRadius: '5px' }}>
        <h2>Erreurs d'importation détectées</h2>
        <p>Certains composants n'ont pas été correctement importés :</p>
        <ul>
          {Object.entries(importStatus).map(([name, type]) => (
            <li key={name}>
              <strong>{name}:</strong> {type === 'function' ? '✅ OK' : `❌ Type incorrect: ${type}`}
            </li>
          ))}
        </ul>
        <p>Veuillez corriger ces erreurs avant de continuer.</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Carnet de santé - accessible au patient et au médecin */}
      <Route path="/carnet-sante/:id" element={<ProtectedRoute><CarnetSante /></ProtectedRoute>} />
      <Route path="/carnet-sante" element={<ProtectedRoute><CarnetSante /></ProtectedRoute>} />
      {/* Auth public */}
      <Route path="/auth/login"    element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Routes d'authentification complémentaires - à implémenter */}
            <Route path="/auth/verification-pending" element={<VerificationPendingPage />} />
     <Route path="/auth/verify-code" element={<VerifyCodePage />} />
    <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
    <Route path="/auth/verify-sms" element={<VerifySmsPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />

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

      {/* Autres pages patient */}
      <Route path="/vaccinations" element={<ProtectedRoute><VaccinationsPage /></ProtectedRoute>} />
      <Route path="/documents"    element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
      <Route path="/partage"      element={<ProtectedRoute><PartagePage /></ProtectedRoute>} />

      {/* Partage public (sans auth) */}
      <Route path="/partage/:token" element={<PartageLienPublic />} />

      {/* Profil & settings - redirection vers les nouveaux profils */}
      <Route path="/profile" element={<Navigate to="/profile/private" replace />} />
      
      {/* Sécurité du compte - à implémenter */}
      {/* <Route path="/account/security" element={<ProtectedRoute><AccountSecurityPage /></ProtectedRoute>} /> */}
      
      {/* Nouveaux profils granulaires */}
      <Route path="/profile/private" element={<ProtectedRoute><PatientProfilePrive /></ProtectedRoute>} />
      <Route path="/profile/medecin" element={<ProtectedRoute allowedRoles={['medecin']}><MedecinProfilePrive /></ProtectedRoute>} />
      <Route path="/profile/emergency/:token" element={<EmergencyProfile />} />
      
      {/* Gestion des relations patient-médecin */}
      <Route path="/my-patients" element={<ProtectedRoute allowedRoles={['medecin']}><MyPatientsPage /></ProtectedRoute>} />
      <Route path="/medecin/planning" element={<ProtectedRoute allowedRoles={['medecin']}><PlanningPage /></ProtectedRoute>} />
      <Route path="/consultation/:id" element={<ProtectedRoute allowedRoles={['medecin']}><ConsultationDetails /></ProtectedRoute>} />
      <Route path="/traitants" element={<ProtectedRoute allowedRoles={['patient']}><TraitantManagementPage /></ProtectedRoute>} />
      <Route path="/requests/received" element={<ProtectedRoute allowedRoles={['medecin']}><MedecinRequestsPage /></ProtectedRoute>} />
      
      <Route path="/settings/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />


  {/* Routes publiques */}
  <Route path="/doctors/:medecinId/public" element={<MedecinProfilePublic />} />
  <Route path="/patients/:patientId/public" element={<PatientProfilePublic />} />
  
  {/* Demo page for UserMenu */}
  <Route path="/usermenu" element={<UserMenu />} />

      {/* Logout */}
      <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
