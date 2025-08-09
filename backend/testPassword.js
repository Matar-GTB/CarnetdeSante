import bcrypt from 'bcrypt';
import sequelize from './config/db.js';
import User from './models/User.js';

// Paramètres à modifier
const email = 'ouedbricerp24@gmail.com';           // l'email de l'utilisateur à tester
const plainPassword = 'Brice@2004'; // le mot de passe en clair à tester

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base OK');

    // Récupération de l'utilisateur
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'email', 'mot_de_passe']
    });

    if (!user) {
      console.error('❌ Utilisateur introuvable');
      process.exit(1);
    }

    console.log('📌 Hash trouvé en base :', user.mot_de_passe);
    console.log('📏 Longueur du hash   :', user.mot_de_passe.length);

    // Comparaison bcrypt
    const isValid = await bcrypt.compare(plainPassword, user.mot_de_passe);

    console.log('🔍 Résultat comparaison :', isValid ? '✅ Mot de passe CORRECT' : '❌ Mot de passe INCORRECT');

    process.exit(0);
  } catch (err) {
    console.error('💥 Erreur lors du test :', err);
    process.exit(1);
  }
})();
