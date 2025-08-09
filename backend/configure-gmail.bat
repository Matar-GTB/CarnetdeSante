:: Configuration des identifiants Gmail pour l'envoi d'emails
@echo off
echo.
echo ============================================================
echo     CONFIGURATION DES IDENTIFIANTS GMAIL POUR L'ENVOI D'EMAILS
echo ============================================================
echo.
echo Pour utiliser Gmail comme service d'envoi d'emails, vous devez :
echo.
echo 1. Activer l'authentification à deux facteurs sur votre compte Google :
echo    https://myaccount.google.com/security
echo.
echo 2. Créer un mot de passe d'application spécifique :
echo    https://myaccount.google.com/apppasswords
echo.
echo 3. Sélectionner "Autre (nom personnalisé)" dans la liste déroulante
echo    et nommez-le "CarnetdeSante"
echo.
echo 4. Copier le mot de passe de 16 caractères généré
echo.
echo 5. Ouvrir le fichier .env dans le dossier backend et ajouter :
echo    EMAIL_FROM=votre-email@gmail.com
echo    EMAIL_PASSWORD=le-mot-de-passe-généré
echo.
echo ============================================================
echo.
pause
