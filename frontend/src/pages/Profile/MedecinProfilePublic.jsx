

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMedecinPublicProfile } from '../../services/profileService';
import { getAvisMedecin } from '../../services/avisService';
import './MedecinProfilePublic.css';
import { 
  FaMapMarkerAlt, FaGraduationCap, FaRegStickyNote, 
  FaUserPlus, FaExclamationTriangle, FaClock, FaCalendarAlt,
  FaStar, FaComment, FaArrowLeft, FaUserMd
} from 'react-icons/fa';
import AvisList from '../../components/avis/AvisList';
import AvisForm from '../../components/avis/AvisForm';
import { AuthContext } from '../../contexts/AuthContext';


const Card = ({ icon, title, children }) => (
  <div className="card">
    <div className="card-header">
      <span className="card-icon">{icon}</span>
      <span className="card-title">{title}</span>
    </div>
    <div className="card-content">{children}</div>
  </div>
);

const Tag = ({ value }) => {
  // Validation pour s'assurer que la valeur est bien 'Oui' ou 'Non'
  const safeValue = value === true || value === 'Oui' ? 'Oui' : 'Non';
  return (
    <span className={`tag ${safeValue === 'Oui' ? 'tag-yes' : 'tag-no'}`}>
      {safeValue}
    </span>
  );
};

const MedecinProfilePublic = () => {
  const { medecinId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [medecin, setMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avis, setAvis] = useState([]);
  const [avisLoading, setAvisLoading] = useState(true);
  const [showAvisForm, setShowAvisForm] = useState(false);

  useEffect(() => {
    // Vérification de sécurité pour l'ID
    if (!medecinId || !/^\d+$/.test(medecinId)) {
      setError('Identifiant de médecin invalide');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('🔍 Récupération du profil médecin public, ID:', medecinId);
        const res = await getMedecinPublicProfile(medecinId);
        
        // Validation des données reçues
        if (res.success && res.data) {
          console.log('✅ Profil médecin récupéré avec succès');
          // Le backend vérifie déjà si le profil est public
          const sanitizedData = { ...res.data };
          setMedecin(sanitizedData);
          setError(null);
          
          // Une fois le profil chargé avec succès, charger les avis
          fetchAvis();
        } else {
          console.error('❌ Erreur de chargement du profil:', res.message);
          setError(res.message || 'Erreur lors de la récupération du profil public du médecin');
        }
      } catch (err) {
        console.error('❌ Exception lors du chargement du profil:', err);
        setError('Une erreur est survenue lors du chargement du profil médecin');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchAvis = async () => {
      try {
        setAvisLoading(true);
        console.log('Récupération des avis pour le médecin ID:', medecinId);
        const avisData = await getAvisMedecin(medecinId);
        console.log('Données d\'avis reçues:', avisData);
        
        // S'assurer que avisData est un tableau
        if (Array.isArray(avisData)) {
          console.log('Nombre d\'avis trouvés:', avisData.length);
          setAvis(avisData);
        } else {
          console.warn('Les données d\'avis reçues ne sont pas un tableau:', avisData);
          setAvis([]);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des avis:', err);
        // Ne pas bloquer l'affichage du profil si les avis ne se chargent pas
        setAvis([]);
      } finally {
        setAvisLoading(false);
      }
    };
    
    fetchProfile();
  }, [medecinId]);

  // Fonctions pour gérer les avis
  const handleAddAvis = () => {
    setShowAvisForm(true);
  };

  const handleAvisSubmitted = async () => {
    setShowAvisForm(false);
    // Recharger les avis après soumission
    try {
      setAvisLoading(true);
      console.log('Rechargement des avis après soumission pour médecin ID:', medecinId);
      const avisData = await getAvisMedecin(medecinId);
      console.log('Données d\'avis reçues après soumission:', avisData);
      
      // S'assurer que avisData est un tableau
      if (Array.isArray(avisData)) {
        console.log('Nombre d\'avis après soumission:', avisData.length);
        setAvis(avisData);
      } else {
        console.warn('Les données d\'avis reçues après soumission ne sont pas un tableau:', avisData);
        setAvis([]);
      }
    } catch (err) {
      console.error('Erreur lors du rechargement des avis:', err);
    } finally {
      setAvisLoading(false);
    }
  };

  const handleCancelAvis = () => {
    setShowAvisForm(false);
  };

  if (loading) {
    return (
      <div className="medecin-public-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du profil médecin...</p>
      </div>
    );
  }
  
  if (error || !medecin) {
    return (
      <div className="medecin-public-error">
        <div className="error-icon"><FaExclamationTriangle /></div>
        <p>{error || 'Profil médecin non trouvé'}</p>
        <p className="error-help">Veuillez vérifier l'identifiant du médecin ou réessayer plus tard.</p>
      </div>
    );
  }

  // Fonction pour revenir à la page précédente
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <main className="medecin-profile-public">
      <button className="back-button" onClick={handleGoBack}>
        <FaArrowLeft /> Retour
      </button>
      
      <header className="profile-header">
        <div className="avatar">{medecin.photo_profil ? <img src={medecin.photo_profil} alt="Avatar" /> : <FaUserMd />}</div>
        <div>
          <h1>Dr. {medecin.prenom} {medecin.nom}</h1>
          <div className="specialite">{medecin.specialite}</div>
        </div>
      </header>

      {/* Section Coordonnées */}
      <section className="profile-section">
        <h2 className="section-title">
          <span className="section-icon"><FaMapMarkerAlt /></span>
          Coordonnées
        </h2>
        <div className="section-content">
          <div className="info-row">
            <div className="info-label">Adresse du cabinet:</div>
            <div className="info-value">{medecin.adresse_cabinet || <span className="empty">Non renseignée</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Téléphone du cabinet:</div>
            <div className="info-value">{medecin.telephone_cabinet || <span className="empty">Non renseigné</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Email:</div>
            <div className="info-value">{medecin.email ? 
              medecin.email.replace(/(.{2})(.*)(?=@)/g, (_, a, b) => a + b.replace(/./g, '*')) : 
              <span className="empty">Non renseigné</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Téléphone personnel:</div>
            <div className="info-value">{medecin.telephone ? 
              medecin.telephone.replace(/(\d{2})(\d+)(\d{2})/g, '$1 ** ** ** $3') : 
              <span className="empty">Non renseigné</span>}</div>
          </div>
        </div>
      </section>

      {/* Section Disponibilités en cartes */}
      <section className="cards-section">
        <h2 className="section-title">
          <span className="section-icon"><FaClock /></span>
          Disponibilités
        </h2>
        <div className="cards-grid">
          <Card icon={<FaUserPlus />} title="Nouveaux patients">
            <Tag value={medecin.accepte_nouveaux_patients ? 'Oui' : 'Non'} />
          </Card>
          <Card icon={<FaUserPlus />} title="Accepte non traitants">
            <Tag value={medecin.accepte_non_traitants ? 'Oui' : 'Non'} />
          </Card>
          <Card icon={<FaExclamationTriangle />} title="Consultation urgence">
            <Tag value={medecin.consultations_urgence ? 'Oui' : 'Non'} />
          </Card>
        </div>
        <div className="schedule-info">
          <div className="info-row">
            <div className="info-label"><FaClock className="inline-icon" /> Horaires de travail:</div>
            <div className="info-value">{medecin.horaires_travail || <span className="empty">Non renseigné</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label"><FaCalendarAlt className="inline-icon" /> Jours disponibles:</div>
            <div className="info-value">{medecin.jours_disponibles || <span className="empty">Non renseigné</span>}</div>
          </div>
        </div>
      </section>

      {/* Section Qualifications professionnelles */}
      <section className="profile-section">
        <h2 className="section-title">
          <span className="section-icon"><FaGraduationCap /></span>
          Qualifications professionnelles
        </h2>
        <div className="section-content">
          <div className="info-row">
            <div className="info-label">Spécialité:</div>
            <div className="info-value">{medecin.specialite || <span className="empty">Non renseignée</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Sous-spécialités:</div>
            <div className="info-value">{medecin.sous_specialites || <span className="empty">Non renseignées</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Diplôme:</div>
            <div className="info-value">{medecin.diplome || <span className="empty">Non renseigné</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Numéro d'ordre:</div>
            <div className="info-value">{medecin.numero_ordre || <span className="empty">Non renseigné</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Établissements:</div>
            <div className="info-value">{medecin.etablissements || <span className="empty">Non renseigné</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Parcours professionnel:</div>
            <div className="info-value">{medecin.parcours_professionnel || <span className="empty">Non renseigné</span>}</div>
          </div>
        </div>
      </section>

      {/* Section Informations pratiques */}
      <section className="profile-section">
        <h2 className="section-title">
          <span className="section-icon"><FaRegStickyNote /></span>
          Informations pratiques
        </h2>
        <div className="section-content">
          <div className="info-row">
            <div className="info-label">Description:</div>
            <div className="info-value">{medecin.description || <span className="empty">Non renseignée</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Langues:</div>
            <div className="info-value">{medecin.langues || <span className="empty">Non renseignées</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Tarifs:</div>
            <div className="info-value">{medecin.tarifs || <span className="empty">Non renseigné</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Moyens de paiement:</div>
            <div className="info-value">{medecin.moyens_paiement || <span className="empty">Non renseigné</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Accessibilité:</div>
            <div className="info-value">{medecin.accessibilite || <span className="empty">Non renseignée</span>}</div>
          </div>
          <div className="info-row">
            <div className="info-label">FAQ:</div>
            <div className="info-value">
              {Array.isArray(medecin.faq) ? 
                medecin.faq.join(', ') : 
                (medecin.faq || <span className="empty">Non renseignée</span>)}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">Sexe:</div>
            <div className="info-value">{medecin.sexe || <span className="empty">Non renseigné</span>}</div>
          </div>
        </div>
      </section>

      {/* Section Avis des patients */}
      <section className="profile-section avis-section">
        <h2 className="section-title">
          <span className="section-icon"><FaComment /></span>
          Avis des patients
        </h2>
        
        <div className="avis-guide">
          <p>Les avis ci-dessous sont des retours d'expérience de patients. Chaque patient peut laisser un seul avis qui peut être modifié par la suite.</p>
        </div>
        
        <div className="avis-actions">
          {user && user.role === 'patient' ? (
            <button 
              className="add-avis-btn" 
              onClick={handleAddAvis}
            >
              <FaStar className="btn-icon" /> Laisser un avis
            </button>
          ) : (
            <div className="avis-help-message">
              {!user ? (
                <p>Vous devez être <strong>connecté en tant que patient</strong> pour laisser un avis.</p>
              ) : user.role !== 'patient' ? (
                <p>Seuls les <strong>patients</strong> peuvent laisser des avis sur les médecins.</p>
              ) : null}
            </div>
          )}
        </div>

        {avisLoading ? (
          <div className="avis-loading">
            <div className="loading-spinner small"></div>
            <p>Chargement des avis...</p>
          </div>
        ) : (
          <AvisList avis={avis} />
        )}
        
        {showAvisForm && (
          <AvisForm 
            medecinId={medecinId} 
            medecinNom={`${medecin.prenom} ${medecin.nom}`}
            onAvisSubmitted={handleAvisSubmitted}
            onCancel={handleCancelAvis}
          />
        )}
      </section>
    </main>
  );
};

export default MedecinProfilePublic;