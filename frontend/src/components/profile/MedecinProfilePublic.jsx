import React,{ useContext } from 'react';
import './MedecinProfilePublic.css';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../services/profileService';

import { AuthContext } from '../../contexts/AuthContext';
// Props attendues : medecin (objet), onPrendreRdv (callback), onEnvoyerMessage (callback), onLaisserAvis (callback)
// Les flags email_public, tel_public contrôlent la visibilité

const MedecinProfilePublic = ({
  medecin,
  onPrendreRdv,
  onEnvoyerMessage,
  onLaisserAvis
}) => {
    const navigate = useNavigate();
    const { token, role } = useContext(AuthContext);
    if (!token) {
  return <div className="unauthorized"> Vous devez être connecté pour consulter ce profil.</div>;
}
  if (!medecin) return <div>Chargement...</div>;

  // Simule la logique de visibilité (peut être dynamic depuis la BDD)
  const showEmail = medecin.email_public !== false && medecin.email;
  const showTel = medecin.tel_public !== false && medecin.telephone;
let photoUrl = "/default-doctor.jpg";
  if (medecin.photo_profil) {
    if (medecin.photo_profil.startsWith('/uploads')) {
      photoUrl = `${API_BASE_URL}${medecin.photo_profil}`;
    } else if (medecin.photo_profil.startsWith('http')) {
      photoUrl = medecin.photo_profil;
    } else if (
      medecin.photo_profil !== "default-avatar.jpg" && 
      medecin.photo_profil !== ""
    ) {
      photoUrl = `${API_BASE_URL}/${medecin.photo_profil.replace(/^\//, '')}`;
    }
  }

  return (
    <div className="public-doctor-profile">
      {/* En-tête */}
      <div className="profile-header">
    <img src={photoUrl} alt="Médecin" className="photo" />
        <div>
          <h1>Dr {medecin.prenom} {medecin.nom}</h1>
          <div className="specialite">{medecin.specialite}</div>
          <div className="etablissements">{medecin.etablissements}</div>
        </div>
      </div>

      {/* Prise de rendez-vous en ligne */}
      <div className="actions">
       <button
  className="btn-primary"
  onClick={() => navigate(`/appointments/with/${medecin.id}`)}
>
  Prendre rendez-vous en ligne
</button>
      </div>

      {/* Notation/Avis (optionnel) */}
      <div className="section">
        <h3>Avis des patients</h3>
        {/* Bloc de notation/avis, à brancher sur ton backend */}
        <div className="avis-container">
          {/* Exemple : */}
          {medecin.avis && medecin.avis.length > 0 ? (
            medecin.avis.map((avis, idx) => (
              <div key={idx} className="avis">
                <div>
                  <span className="etoiles">{'★'.repeat(avis.note)}{'☆'.repeat(5 - avis.note)}</span>
                  <span className="avis-date">{avis.date}</span>
                </div>
                <div className="avis-commentaire">{avis.commentaire}</div>
              </div>
            ))
          ) : (
            <div>Aucun avis pour le moment.</div>
          )}
          {/* Laisser un avis */}
          {onLaisserAvis && (
            <button className="btn-secondary" onClick={onLaisserAvis}>
              Laisser un avis
            </button>
          )}
        </div>
      </div>

      {/* Tarifs et moyens de paiement */}
      <div className="section">
        <h3>Tarifs & Remboursement</h3>
        <div>{medecin.tarifs || <i>Non renseigné</i>}</div>
        <div>Moyens de paiement : {medecin.moyens_paiement || <i>Non renseigné</i>}</div>
      </div>

      {/* Adresse & accessibilité */}
      <div className="section">
        <h3>Adresse & Accessibilité</h3>
        <div>{medecin.adresse}</div>
        <div>{medecin.accessibilite}</div>
      </div>

      {/* Présentation */}
      <div className="section">
        <h3>Présentation</h3>
        <p>{medecin.description || "Non renseigné."}</p>
      </div>

      {/* Diplômes & expérience */}
      <div className="section">
        <h3>Diplômes & Expérience</h3>
        <div>{medecin.diplome}</div>
        <div>{medecin.parcours_professionnel}</div>
      </div>

      {/* Langues parlées */}
      <div className="section">
        <h3>Langues parlées</h3>
        <div>{medecin.langues || "Non renseigné"}</div>
      </div>

      {/* Horaires */}
      <div className="section">
        <h3>Horaires de consultation</h3>
        <div>{medecin.horaires_travail || "Non renseigné"}</div>
      </div>

      {/* FAQ */}
      {medecin.faq && medecin.faq.length > 0 && (
        <div className="section">
          <h3>FAQ</h3>
          <ul>
            {medecin.faq.map((item, i) => (
              <li key={i}>
                <strong>{item.question}</strong>
                <div>{item.reponse}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact rapide */}
      <div className="section">
        <h3>Contact rapide</h3>
        {showEmail && (
          <div>
            Email : <a href={`mailto:${medecin.email}`}>{medecin.email}</a>
          </div>
        )}
        {showTel && (
          <div>
            Téléphone : <a href={`tel:${medecin.telephone}`}>{medecin.telephone}</a>
          </div>
        )}
        <button className="btn-secondary" onClick={onEnvoyerMessage}>
          Envoyer un message sécurisé
        </button>
      </div>
    </div>
  );
};

export default MedecinProfilePublic;
