// utils/medicalUtils.js

// Validation des données médicales (version simplifiée)
export const validateMedicalData = (data) => {
  // Vérifier la date de naissance
  if (data.date_naissance) {
    const birthDate = new Date(data.date_naissance);
    if (birthDate > new Date()) {
      throw new Error('La date de naissance ne peut pas être dans le futur');
    }
  }
  
  // Vérifier la date de vaccination
  if (data.date) {
    const vaccinDate = new Date(data.date);
    if (vaccinDate > new Date()) {
      throw new Error('La vaccination ne peut pas être datée du futur');
    }
  }
  
  return data;
};

// Vérifier les consentements (version sécurisée)
export const userHasConsent = (userId) => {
  try {
    const consents = JSON.parse(localStorage.getItem('medicalConsents') || '{}');
    const userConsent = consents[userId];
    
    // Vérifier si le consentement est valide et non expiré
    return (
      userConsent?.status === 'granted' && 
      (!userConsent.expiry || new Date(userConsent.expiry) > new Date())
    );
  } catch {
    return false;
  }
};