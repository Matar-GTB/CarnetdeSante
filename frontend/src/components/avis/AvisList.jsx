import React, { useState, useEffect, useRef } from 'react';
import './AvisList.css';
import { FaUser, FaChevronRight, FaChevronLeft, FaEye } from 'react-icons/fa';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const AvisList = ({ avis }) => {
  // États pour le carrousel et la modal
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllAvis, setShowAllAvis] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const carouselRef = useRef(null);
  const timerRef = useRef(null);

  // Vérifier que avis est bien un tableau
  const avisArray = Array.isArray(avis) ? avis : [];
  
  // Fonction pour faire défiler les avis automatiquement
  useEffect(() => {
    if (autoScroll && avisArray.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === avisArray.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Défiler toutes les 5 secondes
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoScroll, avisArray.length]);

  // Arrêter le défilement automatique quand on survole le carrousel
  const handleMouseEnter = () => {
    setAutoScroll(false);
  };

  // Reprendre le défilement automatique quand on quitte le carrousel
  const handleMouseLeave = () => {
    setAutoScroll(true);
  };

  // Navigation manuelle
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === avisArray.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? avisArray.length - 1 : prevIndex - 1
    );
  };

  // Afficher la modal avec tous les avis
  const handleShowAllAvis = () => {
    setShowAllAvis(true);
    setAutoScroll(false);
  };

  // Fermer la modal
  const handleCloseModal = () => {
    setShowAllAvis(false);
    setAutoScroll(true);
  };
  
  if (avisArray.length === 0) {
    return (
      <div className="no-avis">
        <p><strong>Aucun avis n'a encore été laissé pour ce médecin.</strong></p>
        <p className="avis-tip">Les avis vous permettent de consulter les expériences d'autres patients avec ce médecin. Si vous êtes patient de ce médecin, n'hésitez pas à partager votre expérience en cliquant sur le bouton "Laisser un avis".</p>
      </div>
    );
  }

  // Calculer la moyenne des notes
  const totalNotes = avisArray.reduce((sum, a) => sum + (a.note || 0), 0);
  const moyenneNote = (totalNotes / avisArray.length).toFixed(1);
  
  // Compter les avis par nombre d'étoiles
  const distribution = [0, 0, 0, 0, 0]; // index 0 = 1 étoile, index 4 = 5 étoiles
  avisArray.forEach(a => {
    if (a.note >= 1 && a.note <= 5) {
      distribution[a.note - 1]++;
    }
  });
  
  const totalAvis = avisArray.length;

  return (
    <div className="avis-list-container">
      <div className="avis-summary">
        <div className="avis-average">
          <div className="average-rating">{moyenneNote}</div>
          <div className="star-display">
            {[...Array(5)].map((_, index) => (
              <span 
                key={index} 
                className={`summary-star ${index < Math.round(moyenneNote) ? 'filled' : 'empty'}`}
              >
                ★
              </span>
            ))}
          </div>
          <div className="total-avis">{totalAvis} avis</div>
        </div>
        
        <div className="avis-distribution">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars - 1];
            const percentage = totalAvis > 0 ? (count / totalAvis) * 100 : 0;
            
            return (
              <div key={stars} className="distribution-row">
                <div className="stars-label">{stars} étoile{stars > 1 ? 's' : ''}</div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="count-label">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carousel d'avis - défilement automatique */}
      <div 
        className="avis-carousel"
        ref={carouselRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className="carousel-btn prev-btn" onClick={goToPrev}>
          <FaChevronLeft />
        </button>
        
        <div className="carousel-container">
          {avisArray.map((a, index) => (
            <div 
              key={a.id || `avis-${index}`} 
              className={`avis-card carousel-item ${index === currentIndex ? 'active' : ''}`}
            >
              <div className="avis-header">
                <div className="avis-author">
                  {a.anonyme ? (
                    <><FaUser className="user-icon" /> Patient anonyme</>
                  ) : (
                    <>{a.patient_nom || 'Patient'}</>
                  )}
                </div>
                <div className="avis-date">{formatDate(a.date_creation || new Date())}</div>
              </div>
              
              <div className="avis-rating">
                {[...Array(5)].map((_, starIndex) => (
                  <span 
                    key={starIndex} 
                    className={`star ${starIndex < a.note ? 'filled' : 'empty'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              
              {a.commentaire && (
                <div className="avis-comment">{a.commentaire}</div>
              )}
            </div>
          ))}
        </div>
        
        <button className="carousel-btn next-btn" onClick={goToNext}>
          <FaChevronRight />
        </button>

        <div className="carousel-indicators">
          {avisArray.map((_, index) => (
            <span 
              key={index} 
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
      
      {/* Bouton pour voir tous les avis */}
      <div className="see-all-btn-container">
        <button className="see-all-btn" onClick={handleShowAllAvis}>
          <FaEye /> Voir tous les avis ({avisArray.length})
        </button>
      </div>
      
      {/* Modal pour afficher tous les avis */}
      {showAllAvis && (
        <div className="avis-modal-overlay" onClick={handleCloseModal}>
          <div className="avis-modal" onClick={e => e.stopPropagation()}>
            <h3>Tous les avis sur ce médecin</h3>
            <div className="avis-list">
              {avisArray.map((a, index) => (
                <div key={a.id || `avis-full-${index}`} className="avis-card">
                  <div className="avis-header">
                    <div className="avis-author">
                      {a.anonyme ? (
                        <><FaUser className="user-icon" /> Patient anonyme</>
                      ) : (
                        <>{a.patient_nom || 'Patient'}</>
                      )}
                    </div>
                    <div className="avis-date">{formatDate(a.date_creation || new Date())}</div>
                  </div>
                  
                  <div className="avis-rating">
                    {[...Array(5)].map((_, starIndex) => (
                      <span 
                        key={starIndex} 
                        className={`star ${starIndex < a.note ? 'filled' : 'empty'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  
                  {a.commentaire && (
                    <div className="avis-comment">{a.commentaire}</div>
                  )}
                </div>
              ))}
            </div>
            <button className="close-modal-btn" onClick={handleCloseModal}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvisList;
