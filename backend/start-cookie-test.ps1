Write-Host "🍪 Démarrage du serveur de test pour cookies HttpOnly..." -ForegroundColor Yellow

# Naviguer vers le dossier backend
Set-Location -Path "C:\Users\ouedb\my-app\CarnetdeSante\backend"

Write-Host "📁 Dossier courant: $(Get-Location)" -ForegroundColor Cyan

# Vérifier si Node.js est disponible
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js non trouvé! Veuillez l'installer." -ForegroundColor Red
    pause
    exit
}

# Démarrer le serveur de test
Write-Host "🚀 Lancement du serveur sur le port 5001..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Une fois démarré, vous pourrez :" -ForegroundColor Cyan
Write-Host "  - Ouvrir test-cookies.html dans votre navigateur" -ForegroundColor White
Write-Host "  - Tester les fonctionnalités de cookies HttpOnly" -ForegroundColor White
Write-Host "  - Voir les logs du serveur ici" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Pour arrêter le serveur, appuyez sur Ctrl+C" -ForegroundColor Yellow
Write-Host ""

try {
    node test-cookies.js
} catch {
    Write-Host "❌ Erreur lors du démarrage du serveur" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Serveur arrêté. Appuyez sur une touche pour fermer..."
pause
