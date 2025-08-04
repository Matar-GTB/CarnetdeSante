// backend/utils/encryption.js
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'votre-cle-secrete-32-caracteres-ici';

/**
 * Génère un ID unique pour une conversation
 * @param {number} patientId - ID du patient
 * @param {number} medecinId - ID du médecin
 * @returns {string} - ID unique de conversation
 */
export function genererIdConversation(patientId, medecinId) {
  const sortedIds = [patientId, medecinId].sort();
  return `conv_${sortedIds[0]}_${sortedIds[1]}_${uuidv4().slice(0, 8)}`;
}

/**
 * Chiffre un message
 * @param {string} text - Texte à chiffrer
 * @returns {object} - Objet contenant le texte chiffré
 */
export function chiffrerMessage(text) {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    
    return {
      contenu_chiffre: encrypted,
      iv: null,
      authTag: null
    };
  } catch (error) {
    console.error('Erreur chiffrement:', error);
    return { contenu_chiffre: text, iv: null, authTag: null }; // Fallback sans chiffrement
  }
}

/**
 * Déchiffre un message
 * @param {string} encryptedText - Texte chiffré
 * @param {string} iv - Vecteur d'initialisation (non utilisé avec crypto-js)
 * @param {string} authTag - Tag d'authentification (non utilisé avec crypto-js)
 * @returns {string} - Texte déchiffré
 */
export function dechiffrerMessage(encryptedText, iv, authTag) {
  try {
    if (!encryptedText) return '';
    
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    return decrypted || encryptedText; // Fallback si déchiffrement échoue
  } catch (error) {
    console.error('Erreur déchiffrement:', error);
    return encryptedText; // Retourner le texte original en cas d'erreur
  }
}

/**
 * Génère un hash sécurisé pour un fichier
 * @param {Buffer} buffer - Buffer du fichier
 * @returns {string} - Hash du fichier
 */
export function genererHashFichier(buffer) {
  try {
    const wordArray = CryptoJS.lib.WordArray.create(buffer);
    return CryptoJS.SHA256(wordArray).toString();
  } catch (error) {
    console.error('Erreur génération hash:', error);
    return Date.now().toString(); // Fallback
  }
}

/**
 * Chiffre les métadonnées d'un fichier
 * @param {object} metadata - Métadonnées à chiffrer
 * @returns {string} - Métadonnées chiffrées
 */
export function chiffrerMetadonnees(metadata) {
  try {
    const jsonString = JSON.stringify(metadata);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  } catch (error) {
    console.error('Erreur chiffrement métadonnées:', error);
    return JSON.stringify(metadata); // Fallback
  }
}

/**
 * Déchiffre les métadonnées d'un fichier
 * @param {string} encryptedMetadata - Métadonnées chiffrées
 * @returns {object} - Métadonnées déchiffrées
 */
export function dechiffrerMetadonnees(encryptedMetadata) {
  try {
    if (!encryptedMetadata) return {};
    
    const bytes = CryptoJS.AES.decrypt(encryptedMetadata, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Erreur déchiffrement métadonnées:', error);
    try {
      return JSON.parse(encryptedMetadata); // Essayer de parser directement
    } catch {
      return {}; // Fallback vide
    }
  }
}
