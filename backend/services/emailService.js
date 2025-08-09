// backend/services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Récupérer le dossier courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lire les templates d'emails
const readEmailTemplate = (templateName) => {
  try {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`❌ Erreur lors de la lecture du template ${templateName}:`, error);
    return null;
  }
};

// Configuration de nodemailer avec un vrai service SMTP (Gmail)
let transporter;

// Fonction d'initialisation du transporteur d'emails
const initializeTransporter = async () => {
  try {
    // Configuration pour Gmail
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587');
    const emailSecure = process.env.EMAIL_SECURE === 'true';
    const emailUser = process.env.EMAIL_FROM;
    const emailPass = process.env.EMAIL_PASSWORD;
    
    // Vérifions si les identifiants sont fournis
    if (!emailUser || !emailPass) {
      console.warn('⚠️ Identifiants email non configurés dans .env, utilisation du compte de test Ethereal');
      
      // Fallback à Ethereal si les identifiants ne sont pas configurés
      const testAccount = await nodemailer.createTestAccount();
      console.log('✅ Compte de test Ethereal créé:', testAccount.user);
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('✅ Transporteur email configuré avec Ethereal (mode test)');
      return true;
    }
    
    // Configuration avec les informations réelles
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure, // true pour 465, false pour les autres ports
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    
    console.log(`✅ Transporteur email configuré avec ${emailHost}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du transporteur email:', error);
    return false;
  }
};

// Initialisation immédiate
initializeTransporter();

/**
 * Envoie un email de vérification à l'utilisateur
 * @param {string} to - Email du destinataire
 * @param {string} name - Nom du destinataire
 * @param {string} token - Token de vérification
 * @returns {Promise} - Résultat de l'envoi
 */
export const sendVerificationEmail = async (to, name, token) => {
  try {
    if (!transporter) {
      console.log('⏳ Le transporteur email n\'est pas encore initialisé, tentative de réinitialisation...');
      await initializeTransporter();
      if (!transporter) {
        throw new Error('Impossible d\'initialiser le transporteur email');
      }
    }
    
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    // URL du logo (à remplacer par l'URL réelle de votre logo)
    const logoUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/logo.png`;
    
    // Lire et remplir le template
    let htmlContent = readEmailTemplate('emailVerification');
    if (!htmlContent) {
      // Fallback au cas où le template ne serait pas trouvé
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #6c63ff; text-align: center;">CarnetdeSante - Vérification de votre adresse email</h2>
          <p>Bonjour ${name},</p>
          <p>Merci de vous être inscrit sur CarnetdeSante. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationLink}" style="background-color: #6c63ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Vérifier mon adresse email</a>
          </div>
          <p>Si vous n'avez pas créé de compte sur CarnetdeSante, veuillez ignorer cet email.</p>
          <p>Ce lien est valable pendant 24 heures.</p>
          <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} CarnetdeSante - Tous droits réservés</p>
        </div>
      `;
    } else {
      // Remplacer les variables dans le template
      htmlContent = htmlContent
        .replace(/{{name}}/g, name)
        .replace(/{{verificationLink}}/g, verificationLink)
        .replace(/{{logoUrl}}/g, logoUrl)
        .replace(/{{year}}/g, new Date().getFullYear());
    }
    
    const mailOptions = {
      from: `"CarnetdeSante" <${process.env.EMAIL_FROM || 'noreply@carnetsante.com'}>`,
      to,
      subject: 'Vérification de votre adresse email - CarnetdeSante',
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // Afficher des informations différentes selon le type de service utilisé
    console.log('📧 Email de vérification envoyé:', info.messageId);
    
    // Vérifier si nous utilisons Ethereal (mode test) ou un vrai service d'email
    if (info.messageId) {
      if (info.previewURL) {
        // Mode test avec Ethereal - afficher le lien de prévisualisation
        console.log('\n📨 EMAIL DE TEST ENVOYÉ (ETHEREAL):');
        console.log('👀 Ouvrez ce lien pour voir l\'email envoyé:', info.previewURL);
        console.log('⚠️ Ceci est un email de test qui n\'a pas été réellement envoyé à', to);
      } else {
        // Mode réel - confirmer l'envoi
        console.log('\n📨 EMAIL RÉEL ENVOYÉ:');
        console.log('✅ L\'email a été envoyé avec succès à', to);
        console.log('📬 Vérifiez votre boîte de réception et vos spams');
      }
      
      // Toujours afficher le lien de vérification directe pour le développement
      console.log('\n💡 LIEN DE VÉRIFICATION DIRECT:');
      console.log('🔗', verificationLink);
      console.log('Utilisez ce lien pour vérifier l\'email sans avoir à ouvrir la boîte mail.\n');
    }
    
    return { success: true, messageId: info.messageId, previewURL: info.previewURL };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de vérification:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email de vérification');
  }
};

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} to - Email du destinataire
 * @param {string} name - Nom du destinataire
 * @param {string} token - Token de réinitialisation
 * @returns {Promise} - Résultat de l'envoi
 */
export const sendPasswordResetEmail = async (to, name, token) => {
  try {
    console.log('FRONTEND_URL dans sendPasswordResetEmail:', process.env.FRONTEND_URL);
    // S'assurer d'utiliser la bonne URL pour le lien de réinitialisation
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/auth/reset-password/${token}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #6c63ff; text-align: center;">CarnetdeSante - Réinitialisation de votre mot de passe</h2>
        <p>Bonjour ${name},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #6c63ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
        </div>
        <p>Si vous n'avez pas demandé à réinitialiser votre mot de passe, veuillez ignorer cet email.</p>
        <p>Ce lien est valable pendant 24 heures.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} CarnetdeSante - Tous droits réservés</p>
      </div>
    `;
    
    const mailOptions = {
      from: `"CarnetdeSante" <${process.env.EMAIL_FROM || 'noreply@carnetsante.com'}>`,
      to,
      subject: 'Réinitialisation de votre mot de passe - CarnetdeSante',
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email de réinitialisation envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
  }
};

/**
 * Envoie un email de notification de changement de mot de passe
 * @param {string} to - Email du destinataire
 * @param {string} name - Nom du destinataire
 * @returns {Promise} - Résultat de l'envoi
 */
export const sendPasswordChangedEmail = async (to, name) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #6c63ff; text-align: center;">CarnetdeSante - Confirmation de changement de mot de passe</h2>
        <p>Bonjour ${name},</p>
        <p>Votre mot de passe a été modifié avec succès.</p>
        <p>Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter immédiatement.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} CarnetdeSante - Tous droits réservés</p>
      </div>
    `;
    
    const mailOptions = {
      from: `"CarnetdeSante" <${process.env.EMAIL_FROM || 'noreply@carnetsante.com'}>`,
      to,
      subject: 'Confirmation de changement de mot de passe - CarnetdeSante',
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email de confirmation envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email de confirmation');
  }
};



/**
 * Envoie un rappel médical par email
 * @param {string} to - Email du destinataire
 * @param {string} name - Nom du destinataire
 * @param {string} titre - Titre du rappel
 * @param {string} description - Description du rappel
 * @param {Date} date - Date du rappel
 * @returns {Promise} - Résultat de l'envoi
 */
export const sendReminderEmail = async (to, name, titre, description, date) => {
  try {
    const formattedDate = new Date(date).toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Emoji par défaut
    let emoji = '📌';
    
    // Déterminer l'emoji en fonction du titre (contient des mots-clés)
    const lowerTitle = titre.toLowerCase();
    if (lowerTitle.includes('rendez-vous') || lowerTitle.includes('rdv')) emoji = '📅';
    if (lowerTitle.includes('medicament') || lowerTitle.includes('médicament') || lowerTitle.includes('pilule')) emoji = '💊';
    if (lowerTitle.includes('vaccin') || lowerTitle.includes('vaccination')) emoji = '💉';
    if (lowerTitle.includes('analyse') || lowerTitle.includes('test') || lowerTitle.includes('labo')) emoji = '🔬';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #6c63ff; text-align: center;">CarnetdeSante - Rappel médical</h2>
        <p>Bonjour ${name},</p>
        <div style="background-color: #f5f7ff; padding: 15px; border-left: 4px solid #6c63ff; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0;">${emoji} ${titre}</h3>
          <p><strong>Date et heure:</strong> ${formattedDate}</p>
          <p><strong>Détails:</strong> ${description || 'Aucun détail fourni'}</p>
        </div>
        <p>Connectez-vous à votre compte CarnetdeSante pour plus d'informations.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} CarnetdeSante - Tous droits réservés</p>
      </div>
    `;
    
    const mailOptions = {
      from: `"CarnetdeSante" <${process.env.EMAIL_FROM || 'noreply@carnetsante.com'}>`,
      to,
      subject: `${emoji} Rappel médical : ${titre} - CarnetdeSante`,
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email de rappel envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de rappel:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email de rappel');
  }
};

/**
 * Envoie un email contenant un code de vérification numérique
 * @param {string} to - Email du destinataire
 * @param {string} name - Nom du destinataire
 * @param {string} code - Code de vérification (généralement 6 chiffres)
 * @returns {Promise} - Résultat de l'envoi
 */
export const sendVerificationCode = async (to, name, code) => {
  try {
    if (!transporter) {
      console.log('⏳ Le transporteur email n\'est pas encore initialisé, tentative de réinitialisation...');
      await initializeTransporter();
      if (!transporter) {
        throw new Error('Impossible d\'initialiser le transporteur email');
      }
    }
    
    // URL du logo (à remplacer par l'URL réelle de votre logo)
    const logoUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/logo.png`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #6c63ff; text-align: center;">CarnetdeSante - Code de vérification</h2>
        <p>Bonjour ${name},</p>
        <p>Merci de vous être inscrit sur CarnetdeSante. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
        <div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #f5f7ff; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
          ${code}
        </div>
        <p>Ce code est valable pendant 30 minutes.</p>
        <p>Si vous n'avez pas créé de compte sur CarnetdeSante, veuillez ignorer cet email.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} CarnetdeSante - Tous droits réservés</p>
      </div>
    `;
    
    const mailOptions = {
      from: `"CarnetdeSante" <${process.env.EMAIL_FROM || 'noreply@carnetsante.com'}>`,
      to,
      subject: 'Votre code de vérification - CarnetdeSante',
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // Afficher des informations différentes selon le type de service utilisé
    console.log('📧 Email avec code de vérification envoyé:', info.messageId);
    
    if (info.messageId) {
      if (info.previewURL) {
        // Mode test avec Ethereal - afficher le lien de prévisualisation
        console.log('\n📨 EMAIL DE TEST ENVOYÉ (ETHEREAL):');
        console.log('👀 Ouvrez ce lien pour voir l\'email envoyé:', info.previewURL);
        console.log('⚠️ Ceci est un email de test qui n\'a pas été réellement envoyé à', to);
      } else {
        // Mode réel - confirmer l'envoi
        console.log('\n📨 EMAIL RÉEL ENVOYÉ:');
        console.log('✅ L\'email a été envoyé avec succès à', to);
        console.log('📬 Vérifiez votre boîte de réception et vos spams');
      }
      
      // Toujours afficher le code pour le développement
      console.log('\n💡 CODE DE VÉRIFICATION:');
      console.log('🔢', code);
      console.log('Utilisez ce code pour vérifier l\'email sans avoir à ouvrir la boîte mail.\n');
    }
    
    return { success: true, messageId: info.messageId, previewURL: info.previewURL };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du code de vérification:', error);
    throw new Error('Erreur lors de l\'envoi du code de vérification');
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendReminderEmail,
  sendVerificationCode
};
