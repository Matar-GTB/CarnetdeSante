# Script de nettoyage final - Carnet de Santé Frontend
Write-Host "🧹 NETTOYAGE FINAL DES FICHIERS ORPHELINS" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

# Naviguer vers le frontend
Set-Location "c:\Users\ouedb\my-app\CarnetdeSante\frontend\src"

Write-Host "📁 Suppression des fichiers orphelins restants..." -ForegroundColor Green

# Supprimer tous les fichiers _Improved, _Clean, etc.
$patterns = @("*_Improved*", "*_Clean*", "*_Old*", "*_Backup*", "*_temp*")

foreach ($pattern in $patterns) {
    $files = Get-ChildItem -Path . -Filter $pattern -Recurse -File
    if ($files) {
        Write-Host "🗑️  Suppression de $($files.Count) fichier(s) avec le motif: $pattern" -ForegroundColor Red
        $files | Remove-Item -Force
        $files | ForEach-Object { Write-Host "   ❌ $($_.FullName)" -ForegroundColor DarkRed }
    }
}

Write-Host ""
Write-Host "✅ NETTOYAGE TERMINÉ !" -ForegroundColor Green
Write-Host "📊 État final des fichiers:" -ForegroundColor Cyan

# Compter les fichiers par type
$jsxFiles = (Get-ChildItem -Path . -Filter "*.jsx" -Recurse).Count
$jsFiles = (Get-ChildItem -Path . -Filter "*.js" -Recurse).Count  
$cssFiles = (Get-ChildItem -Path . -Filter "*.css" -Recurse).Count

Write-Host "   📄 Fichiers JSX: $jsxFiles" -ForegroundColor White
Write-Host "   📄 Fichiers JS: $jsFiles" -ForegroundColor White
Write-Host "   🎨 Fichiers CSS: $cssFiles" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Prêt pour le démarrage !" -ForegroundColor Green
