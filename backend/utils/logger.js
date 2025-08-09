// backend/utils/logger.js
/**
 * Module de journalisation centralisé pour l'application
 * Permet de formater et d'enregistrer les logs de manière cohérente
 */

// Niveaux de log disponibles
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  SUCCESS: 2,
  WARNING: 3,
  ERROR: 4,
  CRITICAL: 5
};

// Niveau minimal de log à afficher (configurable via variable d'environnement)
const MIN_LOG_LEVEL = process.env.LOG_LEVEL 
  ? parseInt(process.env.LOG_LEVEL) 
  : (process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG);

/**
 * Journalise un message avec le niveau et les informations spécifiées
 * @param {string} message - Le message à journaliser
 * @param {number} level - Niveau de log (voir LOG_LEVELS)
 * @param {Object} details - Détails supplémentaires à inclure dans le log
 * @param {Error} [error] - Erreur à journaliser (optionnel)
 */
const log = (message, level, details = {}, error = null) => {
  if (level < MIN_LOG_LEVEL) return;
  
  const timestamp = new Date().toISOString();
  let levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level) || 'INFO';
  
  // Formater le message selon le niveau
  let emoji;
  let logMethod = console.log;
  
  switch (level) {
    case LOG_LEVELS.DEBUG:
      emoji = '🔍';
      logMethod = console.debug;
      break;
    case LOG_LEVELS.INFO:
      emoji = 'ℹ️';
      logMethod = console.info;
      break;
    case LOG_LEVELS.SUCCESS:
      emoji = '✅';
      logMethod = console.info;
      break;
    case LOG_LEVELS.WARNING:
      emoji = '⚠️';
      logMethod = console.warn;
      break;
    case LOG_LEVELS.ERROR:
      emoji = '❌';
      logMethod = console.error;
      break;
    case LOG_LEVELS.CRITICAL:
      emoji = '🚨';
      logMethod = console.error;
      break;
    default:
      emoji = 'ℹ️';
      logMethod = console.log;
  }
  
  // Message de base
  const logMessage = `${emoji} [${timestamp}] [${levelName}] ${message}`;
  
  // Log simple si pas de détails ni d'erreur
  if (Object.keys(details).length === 0 && !error) {
    logMethod(logMessage);
    return;
  }
  
  // Log avec détails et/ou erreur
  if (Object.keys(details).length > 0 && !error) {
    logMethod(logMessage, details);
    return;
  }
  
  // Log avec erreur
  if (error) {
    if (Object.keys(details).length > 0) {
      logMethod(logMessage, details, error);
    } else {
      logMethod(logMessage, error);
    }
  }
};

// Fonctions utilitaires pour chaque niveau de log
export const logDebug = (message, details = {}, error = null) => 
  log(message, LOG_LEVELS.DEBUG, details, error);

export const logInfo = (message, details = {}, error = null) => 
  log(message, LOG_LEVELS.INFO, details, error);

export const logSuccess = (message, details = {}, error = null) => 
  log(message, LOG_LEVELS.SUCCESS, details, error);

export const logWarning = (message, details = {}, error = null) => 
  log(message, LOG_LEVELS.WARNING, details, error);

export const logError = (message, details = {}, error = null) => 
  log(message, LOG_LEVELS.ERROR, details, error);

export const logCritical = (message, details = {}, error = null) => 
  log(message, LOG_LEVELS.CRITICAL, details, error);

export default {
  LOG_LEVELS,
  logDebug,
  logInfo,
  logSuccess,
  logWarning,
  logError,
  logCritical
};
