# Guide des Préférences de Notification

## Standardisation des préférences de notification

Pour assurer la cohérence dans l'application Carnet de Santé, les préférences de notification ont été standardisées comme suit :

### Format standard

Les préférences sont stockées dans le champ `prefs_notification` du modèle `User` sous forme de JSON stringifié avec cette structure :

```json
{
  "email": true,
  "sms": false
}
```

### Migration depuis l'ancien format

Si votre application utilisait auparavant le champ `preferences_notifications` (format JSONB), une migration a été mise en place pour transférer ces données vers le nouveau champ standardisé `prefs_notification`.

Pour exécuter manuellement cette migration, utilisez:
```
cd backend
node migrations/migrate_preferences.js
```

Ou via les scripts :
- Windows: `migrations/migrate_preferences.bat`
- PowerShell: `migrations/migrate_preferences.ps1`

## API pour les préférences de notification

### Récupérer les préférences

```
GET /api/notifications/settings
```

Réponse:
```json
{
  "success": true,
  "data": {
    "email": true,
    "sms": false
  }
}
```

### Mettre à jour les préférences

```
PUT /api/notifications/settings
```

Corps de la requête:
```json
{
  "preferences": {
    "email": true,
    "sms": true
  }
}
```

Réponse:
```json
{
  "success": true,
  "message": "Préférences mises à jour",
  "data": {
    "email": true,
    "sms": true
  }
}
```

## Utilisation dans l'application

Les préférences de notification sont utilisées dans :
- L'envoi de rappels médicaux
- Les notifications système
- Les alertes de rendez-vous
- Les notifications de partage de documents

## Services concernés

- `reminderService.js`: Pour les rappels médicaux
- `notificationController.js`: Pour la gestion des préférences
- `emailService.js`: Pour l'envoi d'emails
- `smsService.js`: Pour l'envoi de SMS
