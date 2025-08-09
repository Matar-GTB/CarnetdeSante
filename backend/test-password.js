// Script de test pour vérifier le hachage et la vérification des mots de passe
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function testPassword() {
  const testPassword = "TestMotDePasse123!";
  
  console.log("=== TEST DE HACHAGE ET VÉRIFICATION ===");
  console.log("Mot de passe à tester:", testPassword);
  
  // 1. Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(testPassword, SALT_ROUNDS);
  console.log("Hash généré:", hashedPassword);
  
  // 2. Vérifier avec le même mot de passe
  const isValid = await bcrypt.compare(testPassword, hashedPassword);
  console.log("Vérification avec le bon mot de passe:", isValid);
  
  // 3. Vérifier avec un mauvais mot de passe
  const isInvalid = await bcrypt.compare("MauvaisMotDePasse", hashedPassword);
  console.log("Vérification avec un mauvais mot de passe:", isInvalid);
  
  // 4. Test avec le hash de votre problème
  const problematicHash = "$2b$12$WTHzaSw.XzcHloWJ0Vr6w.nuPi4ph.ZaKOnwhuIEGGdkWFqu9YjIm";
  console.log("\n=== TEST AVEC LE HASH PROBLÉMATIQUE ===");
  console.log("Hash problématique:", problematicHash);
  
  // Tester différents mots de passe courants
  const commonPasswords = [
    "password",
    "Password123!",
    "admin",
    "Admin123!",
    "123456",
    "password123",
    "Password1!",
    "test123",
    "Test123!",
    "1234",
    "12345678"
  ];
  
  for (const password of commonPasswords) {
    try {
      const result = await bcrypt.compare(password, problematicHash);
      console.log(`Tentative avec "${password}":`, result);
    } catch (error) {
      console.log(`Erreur avec "${password}":`, error.message);
    }
  }
}

testPassword().catch(console.error);
