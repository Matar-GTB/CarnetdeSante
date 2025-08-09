@echo off
REM backend/migrations/migrate_preferences.bat

echo 🔄 Migration des préférences de notification

REM Aller dans le répertoire backend
cd /d "%~dp0\.."

REM Exécuter le script de migration
echo 📊 Exécution du script de migration...
node migrations/migrate_preferences.js

REM Message de fin
echo ✅ Script de migration terminé

REM Attendre que l'utilisateur appuie sur une touche pour fermer
pause
