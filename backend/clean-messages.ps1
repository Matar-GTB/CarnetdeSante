# Script PowerShell pour nettoyer la base de données messages
# Nettoie les données corrompues dans la table messages

$env:PGPASSWORD = "1234"

Write-Host "🔧 Nettoyage de la base de données messages..." -ForegroundColor Yellow

# 1. Vérifier l'état actuel
Write-Host "📊 État actuel de la table messages:"
psql -h localhost -U postgres -d carnet_sante -c "SELECT COUNT(*) as total, COUNT(expediteur_id) as with_sender, COUNT(destinataire_id) as with_recipient FROM messages;"

# 2. Supprimer les messages sans expéditeur ou destinataire
Write-Host "🗑️  Suppression des messages corrompus..."
psql -h localhost -U postgres -d carnet_sante -c "DELETE FROM messages WHERE expediteur_id IS NULL OR destinataire_id IS NULL;"

# 3. Supprimer les messages sans contenu et sans fichier
Write-Host "🗑️  Suppression des messages vides..."
psql -h localhost -U postgres -d carnet_sante -c "DELETE FROM messages WHERE (contenu IS NULL OR contenu = '') AND (fichier_url IS NULL OR fichier_url = '');"

# 4. Mettre à jour les conversation_id manquants
Write-Host "🔄 Mise à jour des conversation_id..."
psql -h localhost -U postgres -d carnet_sante -c "UPDATE messages SET conversation_id = CASE WHEN expediteur_id < destinataire_id THEN CONCAT(expediteur_id, '-', destinataire_id) ELSE CONCAT(destinataire_id, '-', expediteur_id) END WHERE conversation_id IS NULL OR conversation_id = '';"

# 5. Vérifier l'état après nettoyage
Write-Host "✅ État après nettoyage:"
psql -h localhost -U postgres -d carnet_sante -c "SELECT COUNT(*) as total, COUNT(expediteur_id) as with_sender, COUNT(destinataire_id) as with_recipient, COUNT(conversation_id) as with_conversation FROM messages;"

Write-Host "✅ Nettoyage terminé!" -ForegroundColor Green
Write-Host "💡 Vous pouvez maintenant remettre allowNull: false dans Message.js et redémarrer le serveur" -ForegroundColor Cyan
