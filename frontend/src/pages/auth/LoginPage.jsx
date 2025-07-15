// frontend/pages/LoginPage.jsx
import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import '../../components/auth/Login.css';

const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Votre santé,</h1>
        <h2 className="highlight">entre de bonnes mains.</h2>
        <p className="quote">
          “Une plateforme simple, intuitive et sécurisée. Idéale pour suivre tous mes rendez-vous et documents de santé.”
        </p>
        <p className="author">— Brice ., utilisatrice depuis 1 an</p>
      </div>
      <div className="login-right">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;