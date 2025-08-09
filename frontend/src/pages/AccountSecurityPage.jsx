// frontend/src/pages/AccountSecurityPage.jsx
// ⚠️ À IMPLÉMENTER DANS L'APPLICATION : Ajouter cette route dans App.js
// Exemple: <Route path="/account/security" element={<ProtectedRoute><AccountSecurityPage /></ProtectedRoute>} />
import React from 'react';
import { Container } from 'react-bootstrap';
import AccountSecurity from '../components/auth/AccountSecurity';

const AccountSecurityPage = () => {
  return (
    <Container className="py-4">
      <AccountSecurity />
    </Container>
  );
};

export default AccountSecurityPage;
