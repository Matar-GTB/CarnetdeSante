// services/mailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendEmail = async ({ to, subject, text }) => {
  try {
    await transporter.sendMail({
      from: `"Carnet Santé Virtuel" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text
    });
    console.log(`✉️ Email envoyé à ${to}`);
  } catch (err) {
    console.error('❌ Erreur envoi email :', err);
  }
};
export const sendPasswordResetEmail = async (email, token) => {
  const resetURL = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${token}`;
  const subject = 'Réinitialisation de votre mot de passe';
  const text = `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${resetURL}`;

  await sendEmail({ to: email, subject, text });
};