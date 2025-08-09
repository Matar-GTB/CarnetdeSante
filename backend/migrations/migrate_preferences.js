// backend/migrations/migrate_preferences.js
import sequelize from '../config/db.js';
import User from '../models/User.js';

/**
 * Script de migration pour harmoniser les préférences de notification
 * - Vérifie les deux champs prefs_notification et preferences_notifications
 * - Conserve les données du champ preferences_notifications si prefs_notification est vide
 */
const migratePreferences = async () => {
  try {
    console.log('🔄 Démarrage de la migration des préférences de notification...');
    
    // Récupération des utilisateurs ayant l'ancien champ rempli mais pas le nouveau
    const users = await User.findAll({
      attributes: ['id', 'email', 'prefs_notification', 'preferences_notifications'],
      where: sequelize.literal(`
        preferences_notifications IS NOT NULL AND 
        preferences_notifications != '{}' AND 
        (prefs_notification IS NULL OR prefs_notification = '{}')
      `)
    });
    
    console.log(`🔍 Trouvé ${users.length} utilisateurs à migrer...`);
    
    // Migration pour chaque utilisateur
    for (const user of users) {
      console.log(`📝 Migration des préférences pour l'utilisateur ${user.id} (${user.email})`);
      
      try {
        // Si l'ancien champ existe et le nouveau est vide, copier les données
        if (user.preferences_notifications && (!user.prefs_notification || user.prefs_notification === '{}')) {
          // Format prefs standard
          const standardPrefs = {
            email: true,
            sms: false,
            ...user.preferences_notifications
          };
          
          // Mise à jour du champ prefs_notification
          user.prefs_notification = standardPrefs;
          await user.save();
          console.log(`✅ Préférences migrées pour l'utilisateur ${user.id}`);
        }
      } catch (err) {
        console.error(`❌ Erreur lors de la migration pour l'utilisateur ${user.id}:`, err);
      }
    }
    
    console.log('✅ Migration des préférences terminée');
  } catch (error) {
    console.error('❌ Erreur lors de la migration des préférences:', error);
  } finally {
    // Fermer la connexion à la base de données
    await sequelize.close();
  }
};

// Exécution de la migration
migratePreferences();
