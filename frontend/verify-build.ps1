# Script de vérification finale des erreurs de compilation
Write-Host "🔍 VÉRIFICATION FINALE DES ERREURS" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Cyan

# Naviguer vers le frontend
Set-Location "c:\Users\ouedb\my-app\CarnetdeSante\frontend"

Write-Host "📁 Vérification des fichiers CSS manquants..." -ForegroundColor Green

# Vérifier les CSS critiques
$cssFiles = @(
    "src\components\role-specific\medecin\MedecinQuickActions.css",
    "src\components\role-specific\patient\PatientQuickActions.css", 
    "src\pages\dashboard\Dashboard.css",
    "src\pages\dashboard\PatientDashboard.css",
    "src\pages\dashboard\MedecinDashboard.css",
    "src\pages\dashboard\AdminDashboard.css"
)

foreach ($cssFile in $cssFiles) {
    if (Test-Path $cssFile) {
        Write-Host "✅ $cssFile" -ForegroundColor Green
    } else {
        Write-Host "❌ $cssFile - MANQUANT !" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📄 Vérification des composants critiques..." -ForegroundColor Green

# Vérifier les composants critiques
$jsxFiles = @(
    "src\pages\dashboard\Dashboard.jsx",
    "src\pages\dashboard\PatientDashboard.jsx", 
    "src\pages\dashboard\MedecinDashboard.jsx",
    "src\pages\dashboard\AdminDashboard.jsx",
    "src\pages\dashboard\DashboardCard.jsx",
    "src\components\role-specific\medecin\MedecinQuickActions.jsx",
    "src\components\role-specific\patient\PatientQuickActions.jsx"
)

foreach ($jsxFile in $jsxFiles) {
    if (Test-Path $jsxFile) {
        $content = Get-Content $jsxFile -Raw
        if ($content -like "*export default*") {
            Write-Host "✅ $jsxFile (export OK)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $jsxFile (export manquant ?)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ $jsxFile - MANQUANT !" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🚀 Tentative de compilation..." -ForegroundColor Cyan
npm run build
