# backend/migrations/migrate_preferences.ps1

# Message d'initialisation
Write-Host "🔄 Migration des préférences de notification" -ForegroundColor Cyan

# Aller dans le répertoire backend
Set-Location -Path $PSScriptRoot\..

# Exécuter le script de migration
Write-Host "📊 Exécution du script de migration..." -ForegroundColor Yellow
node migrations/migrate_preferences.js

# Message de fin
Write-Host "✅ Script de migration terminé" -ForegroundColor Green

# Attendre que l'utilisateur appuie sur une touche pour fermer
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
