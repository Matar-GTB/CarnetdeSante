// test-reset-password.js
import dotenv from 'dotenv';
import { sendPasswordResetEmail } from './services/emailService.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin absolu du fichier .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

// Charger les variables d'environnement depuis le fichier .env
dotenv.config({ path: envPath });

// Afficher les variables d'environnement chargées
console.log('Variables d\'environnement chargées :');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

async function testReset() {
  try {
    console.log('Envoi d\'un email de réinitialisation de test...');
    // Utiliser un email valide pour tester
    const result = await sendPasswordResetEmail('ouedbricerp@gmail.com', 'Utilisateur Test', 'test-token-123');
    console.log('Résultat:', result);
    console.log('Vérifiez votre boîte de réception et vos spams.');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

testReset();
