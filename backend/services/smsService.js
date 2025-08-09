// backend/services/smsService.js
import twilio from 'twilio';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuration Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Créer le client Twilio ou un mock si en développement
let twilioClient;

try {
  if (process.env.NODE_ENV === 'production') {
    if (accountSid && authToken) {
      twilioClient = twilio(accountSid, authToken);
      console.log('✅ Client Twilio initialisé avec succès');
    } else {
      console.warn('⚠️ Variables d\'environnement Twilio manquantes');
    }
  } else {
    // Mock client for development
    twilioClient = {
      messages: {
        create: async (options) => {
          console.log('📱 SMS SIMULÉ:');
          console.log(`De: ${options.from}`);
          console.log(`À: ${options.to}`);
          console.log(`Contenu: ${options.body}`);
          console.log('SMS aurait été envoyé en production');
          return { sid: 'mock-sms-id-' + Date.now() };
        }
      }
    };
    console.log('✅ Client Twilio simulé initialisé pour le développement');
  }
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation du client Twilio:', error);
}

/**
 * Formater un numéro de téléphone au format international
 * @param {string} phoneNumber - Numéro de téléphone à formater
 * @param {string} defaultRegion - Code pays par défaut (FR par défaut)
 * @returns {string|null} - Numéro formaté ou null si invalide
 */
export const formatPhoneNumber = (phoneNumber, defaultRegion = 'FR') => {
  try {
    const parsedNumber = parsePhoneNumberFromString(phoneNumber, defaultRegion);
    
    if (!parsedNumber) {
      console.error('❌ Impossible de parser le numéro de téléphone');
      return null;
    }
    
    if (!parsedNumber.isValid()) {
      console.error('❌ Numéro de téléphone invalide');
      return null;
    }
    
    return parsedNumber.format('E.164'); // Format international +33XXXXXXXXX
  } catch (error) {
    console.error('❌ Erreur lors du formatage du numéro de téléphone:', error);
    return null;
  }
};

/**
 * Génère un code OTP à N chiffres
 * @param {number} length - Longueur du code OTP (défaut: 6)
 * @returns {string} - Code OTP généré
 */
export const generateOTP = (length = 6) => {
  // Générer un code OTP aléatoire
  const digits = '0123456789';
  let OTP = '';
  
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  
  return OTP;
};

/**
 * Envoie un code OTP par SMS
 * @param {string} phoneNumber - Numéro de téléphone du destinataire
 * @param {string} otp - Code OTP à envoyer
 * @returns {Promise} - Résultat de l'envoi
 */
export const sendOTPBySMS = async (phoneNumber, otp) => {
  try {
    if (!twilioClient) {
      throw new Error('Client Twilio non initialisé');
    }
    
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    if (!formattedNumber) {
      throw new Error('Numéro de téléphone invalide');
    }
    
    const message = await twilioClient.messages.create({
      body: `Votre code de vérification CarnetdeSante est : ${otp}. Ce code est valable 5 minutes.`,
      from: twilioPhoneNumber,
      to: formattedNumber
    });
    
    console.log('📱 SMS envoyé avec l\'ID:', message.sid);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du SMS:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoie un rappel médical par SMS
 * @param {string} phoneNumber - Numéro de téléphone du destinataire
 * @param {string} titre - Titre du rappel
 * @param {Date} date - Date du rappel
 * @returns {Promise} - Résultat de l'envoi
 */
export const sendReminderSMS = async (phoneNumber, titre, date) => {
  try {
    if (!twilioClient) {
      throw new Error('Client Twilio non initialisé');
    }
    
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    if (!formattedNumber) {
      throw new Error('Numéro de téléphone invalide');
    }
    
    const formattedDate = new Date(date).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'numeric',
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
    
    const message = await twilioClient.messages.create({
      body: `${emoji} CarnetdeSante - Rappel: ${titre} - ${formattedDate}`,
      from: twilioPhoneNumber,
      to: formattedNumber
    });
    
    console.log('📱 SMS de rappel envoyé avec l\'ID:', message.sid);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du SMS de rappel:', error);
    return { success: false, error: error.message };
  }
};

export default {
  formatPhoneNumber,
  generateOTP,
  sendOTPBySMS,
  sendReminderSMS
};
