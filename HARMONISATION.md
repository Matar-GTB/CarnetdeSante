# Harmonisation du code et correction des doublons

Ce document présente les travaux d'harmonisation effectués sur le code du projet Carnet de Santé pour éliminer les doublons et les incohérences.

## Corrections effectuées

### 1. Harmonisation des préférences de notification

- ✅ Standardisation sur le champ `prefs_notification` dans le modèle User.js
- ✅ Suppression du champ redondant `preferences_notifications`
- ✅ Mise à jour du contrôleur `notificationController.js` pour utiliser le champ standardisé
- ✅ Correction du composant `AccountSecurity.jsx` pour utiliser l'API correcte
- ✅ Création d'un script de migration `migrate_preferences.js` pour transférer les données de l'ancien format vers le nouveau
- ✅ Ajout d'une documentation détaillée `NOTIFICATION_PREFERENCES.md`

### 2. Correction des doublons de pages

- ✅ Résolution du doublon `RappelsPage.jsx`:
  - Version actuelle: `frontend/src/pages/rappels/RappelsPage.jsx` (version améliorée et utilisée)
  - Version obsolète: `frontend/src/pages/RappelsPage.jsx` (marquée comme obsolète)

### 3. Identification des pages à implémenter

Les pages suivantes ont été identifiées comme importantes mais non intégrées à l'application :

- ⚠️ `AccountSecurityPage.jsx` - Gestion de la sécurité du compte
- ⚠️ `ResetPasswordPage.jsx` - Réinitialisation de mot de passe
- ⚠️ `ForgotPasswordPage.jsx` - Demande de mot de passe oublié

Ces pages ont été annotées et des commentaires ont été ajoutés dans `App.js` pour faciliter leur intégration future.

## Améliorations à venir

1. **Intégration des pages de sécurité** : Intégrer complètement les fonctionnalités de sécurité du compte et de réinitialisation de mot de passe.

2. **Revue des imports** : Vérifier et nettoyer les imports inutilisés ou redondants dans le code.

3. **Organisation du code** : 
   - Harmoniser la structure des dossiers pour les composants et les pages
   - Standardiser les noms de fichiers (ex: utiliser systématiquement des sous-dossiers par fonctionnalité)

4. **Documentation** : Enrichir la documentation pour clarifier l'architecture et les interactions entre composants.

## Comment utiliser les scripts de migration

Pour migrer les données de préférences de notification de l'ancien format au nouveau :

```bash
# PowerShell
cd backend
.\migrations\migrate_preferences.ps1

# Ou avec Batch
cd backend
.\migrations\migrate_preferences.bat
```

Ces scripts transfèrent les données du champ `preferences_notifications` vers `prefs_notification` pour tous les utilisateurs concernés.
