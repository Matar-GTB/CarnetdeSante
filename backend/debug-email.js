// debug-email.js
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

async function testEmail() {
  try {
    console.log('Configuration email :');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '(défini)' : '(non défini)');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Vérifier la connexion
    const verified = await transporter.verify();
    console.log('Connexion SMTP vérifiée:', verified);
    
    // Envoyer un email de test
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password/test-token-123`;
    
    const mailOptions = {
      from: `"CarnetdeSante Test" <${process.env.EMAIL_FROM}>`,
      to: 'test@example.com', // Remplacez par votre email pour tester
      subject: 'Test de réinitialisation de mot de passe',
      html: `
        <div>
          <h2>Test de réinitialisation</h2>
          <p>Ceci est un email de test.</p>
          <p>Lien de réinitialisation: <a href="${resetLink}">${resetLink}</a></p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé:', info.messageId);
    
    if (info.previewURL) {
      console.log('Prévisualisation (Ethereal):', info.previewURL);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors du test:', error);
    return { success: false, error: error.message };
  }
}

testEmail().then(result => console.log('Résultat final:', result));
