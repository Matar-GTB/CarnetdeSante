Voici comment configurer votre fichier .env pour utiliser Gmail :

1. Ouvrez le fichier .env dans le dossier backend
2. Trouvez les lignes suivantes :
   ```
   # Configuration SMTP pour l'envoi d'emails
   EMAIL_FROM=ouedbricerp@gmail.com
   EMAIL_PASSWORD=
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   ```

3. Remplacez EMAIL_PASSWORD= par votre mot de passe d'application Gmail
   Par exemple : EMAIL_PASSWORD=abcd efgh ijkl mnop

4. Sauvegardez le fichier .env

5. Redémarrez le serveur backend avec :
   ```
   cd c:\Users\ouedb\my-app\CarnetdeSante\backend
   node server.js
   ```

Une fois que vous avez configuré votre mot de passe d'application Gmail dans le fichier .env, vous recevrez les vrais emails à l'adresse configurée (ouedbricerp@gmail.com).

N'oubliez pas de vérifier votre dossier de spam si vous ne voyez pas l'email dans votre boîte de réception.
