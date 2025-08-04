// Script de nettoyage direct de la base de données
import sequelize from './config/db.js';

async function cleanMessages() {
  try {
    console.log('🔧 Démarrage du nettoyage de la table messages...');
    
    // 1. Vérifier l'état actuel
    const [results1] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(expediteur_id) as with_sender,
        COUNT(destinataire_id) as with_recipient
      FROM messages
    `);
    console.log('📊 État avant nettoyage:', results1[0]);
    
    // 2. Supprimer les messages corrompus
    const [results2] = await sequelize.query(`
      DELETE FROM messages 
      WHERE expediteur_id IS NULL OR destinataire_id IS NULL
    `);
    console.log('🗑️ Messages corrompus supprimés');
    
    // 3. Supprimer les messages vides
    const [results3] = await sequelize.query(`
      DELETE FROM messages 
      WHERE (contenu IS NULL OR contenu = '') 
        AND (fichier_url IS NULL OR fichier_url = '')
        AND type_message = 'texte'
    `);
    console.log('🗑️ Messages vides supprimés');
    
    // 4. Réparer les conversation_id
    const [results4] = await sequelize.query(`
      UPDATE messages 
      SET conversation_id = CASE 
        WHEN expediteur_id < destinataire_id 
        THEN expediteur_id || '-' || destinataire_id
        ELSE destinataire_id || '-' || expediteur_id
      END
      WHERE conversation_id IS NULL OR conversation_id = ''
    `);
    console.log('🔄 conversation_id réparés');
    
    // 5. Vérifier après nettoyage
    const [results5] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(expediteur_id) as with_sender,
        COUNT(destinataire_id) as with_recipient,
        COUNT(conversation_id) as with_conversation
      FROM messages
    `);
    console.log('✅ État après nettoyage:', results5[0]);
    
    console.log('🎉 Nettoyage terminé avec succès!');
    console.log('💡 Vous pouvez maintenant redémarrer le serveur avec les contraintes NOT NULL');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

cleanMessages();
