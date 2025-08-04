-- Option radicale: recréer la table messages proprement
-- ATTENTION: Ceci supprime TOUS les messages existants

-- Sauvegarder les messages valides (optionnel)
CREATE TABLE messages_backup AS 
SELECT * FROM messages 
WHERE expediteur_id IS NOT NULL 
  AND destinataire_id IS NOT NULL;

-- Supprimer la table actuelle
DROP TABLE IF EXISTS messages CASCADE;

-- La table sera recréée au prochain démarrage du serveur
-- avec la structure correcte depuis le modèle Sequelize
