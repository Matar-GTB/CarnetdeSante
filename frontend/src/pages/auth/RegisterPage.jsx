// frontend/src/pages/auth/RegisterPage.jsx
import React from 'react';
import '../../components/auth/Register.css';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="register-page">
      <div className="register-left">
        <div className="testimonial">
          <h2>Trouvez un médecin de confiance</h2>
          <p>et gérez votre santé en toute sérénité.</p>
          <blockquote>
            "Un outil moderne, facile à utiliser, qui m’a permis de suivre mes traitements
            et de rester en contact avec mes médecins."
          </blockquote>
          <div className="author">– Sarah M.</div>
        </div>
      </div>
      <div className="register-right">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;