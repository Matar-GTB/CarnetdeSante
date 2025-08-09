// backend/services/metricsService.js
import sequelize from '../config/db.js';
import User from '../models/User.js';

/**
 * Service pour suivre les métriques liées aux utilisateurs et à l'authentification
 */
class MetricsService {
  /**
   * Récupérer les statistiques d'inscription et de vérification
   * @param {Object} options - Options de filtrage (plage de dates, etc.)
   * @returns {Object} - Statistiques compilées
   */
  static async getAuthMetrics(options = {}) {
    try {
      const { startDate, endDate } = options;
      
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          [sequelize.Op.between]: [startDate, endDate]
        };
      }
      
      // Compter le nombre total d'inscriptions
      const totalRegistrations = await User.count({
        where: dateFilter
      });
      
      // Compter les vérifications d'email
      const emailVerified = await User.count({
        where: {
          ...dateFilter,
          email_verified: true
        }
      });
      
      // Compter les vérifications de téléphone
      const phoneVerified = await User.count({
        where: {
          ...dateFilter,
          telephone_verified: true
        }
      });
      
      // Compter les comptes entièrement vérifiés
      const fullyVerified = await User.count({
        where: {
          ...dateFilter,
          email_verified: true,
          telephone_verified: true
        }
      });
      
      // Calculer les taux de conversion
      const emailVerificationRate = totalRegistrations ? (emailVerified / totalRegistrations) * 100 : 0;
      const phoneVerificationRate = totalRegistrations ? (phoneVerified / totalRegistrations) * 100 : 0;
      const fullVerificationRate = totalRegistrations ? (fullyVerified / totalRegistrations) * 100 : 0;
      
      return {
        totalRegistrations,
        emailVerified,
        phoneVerified,
        fullyVerified,
        emailVerificationRate: emailVerificationRate.toFixed(2),
        phoneVerificationRate: phoneVerificationRate.toFixed(2),
        fullVerificationRate: fullVerificationRate.toFixed(2)
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des métriques:', error);
      throw new Error('Impossible de récupérer les métriques');
    }
  }
  
  /**
   * Enregistre un événement de vérification d'email
   * @param {number} userId - ID de l'utilisateur
   */
  static async recordEmailVerification(userId) {
    try {
      // Mettre à jour l'utilisateur
      await User.update(
        { 
          email_verified: true,
          email_verified_at: sequelize.literal('CURRENT_TIMESTAMP')
        },
        { where: { id: userId } }
      );
      
      // Ici, vous pourriez également enregistrer cet événement dans une table dédiée
      // aux événements d'authentification pour des analyses plus détaillées
      
      console.log(`✅ Vérification d'email enregistrée pour l'utilisateur ${userId}`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'enregistrement de la vérification d'email pour l'utilisateur ${userId}:`, error);
    }
  }
}

export default MetricsService;
