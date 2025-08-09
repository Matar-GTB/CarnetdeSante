// frontend/src/pages/auth/LoginPage.js
import React from "react";
import { Alert } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import "../../components/auth/Login.css";

// Définition du composant comme fonction nommée (pas de fonction fléchée)
function LoginPage() {
  const location = useLocation();
  const verified = location.state?.verified || false;
  const message = location.state?.message || "";
  
  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Votre santé,</h1>
        <h2 className="highlight">entre de bonnes mains.</h2>
        <p className="quote">
          "Une plateforme simple, intuitive et sécurisée. Idéale pour suivre tous mes rendez-vous et documents de santé."
        </p>
        <p className="author"> Brice ., utilisatrice depuis 1 an</p>
      </div>
      <div className="login-right">
      
        
        {verified && message && (
          <Alert variant="success" className="mb-4">
            {message}
          </Alert>
        )}
        <LoginForm />
      </div>
    </div>
  );
}

// Export par défaut simple
export default LoginPage;
