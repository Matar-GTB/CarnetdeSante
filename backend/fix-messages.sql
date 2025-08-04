-- Nettoyage complet de la table messages
-- Étape 1: Identifier les problèmes
SELECT 'Avant nettoyage:' as etape;
SELECT 
  COUNT(*) as total_messages,
  COUNT(expediteur_id) as avec_expediteur,
  COUNT(destinataire_id) as avec_destinataire,
  COUNT(conversation_id) as avec_conversation,
  COUNT(CASE WHEN expediteur_id IS NULL THEN 1 END) as sans_expediteur,
  COUNT(CASE WHEN destinataire_id IS NULL THEN 1 END) as sans_destinataire
FROM messages;

-- Étape 2: Supprimer les messages corrompus
DELETE FROM messages 
WHERE expediteur_id IS NULL 
   OR destinataire_id IS NULL;

-- Étape 3: Supprimer les messages vides
DELETE FROM messages 
WHERE (contenu IS NULL OR contenu = '') 
  AND (fichier_url IS NULL OR fichier_url = '')
  AND type_message = 'texte';

-- Étape 4: Réparer les conversation_id
UPDATE messages 
SET conversation_id = CASE 
  WHEN expediteur_id < destinataire_id 
  THEN expediteur_id || '-' || destinataire_id
  ELSE destinataire_id || '-' || expediteur_id
END
WHERE conversation_id IS NULL OR conversation_id = '';

-- Étape 5: Vérifier après nettoyage
SELECT 'Après nettoyage:' as etape;
SELECT 
  COUNT(*) as total_messages,
  COUNT(expediteur_id) as avec_expediteur,
  COUNT(destinataire_id) as avec_destinataire,
  COUNT(conversation_id) as avec_conversation
FROM messages;
