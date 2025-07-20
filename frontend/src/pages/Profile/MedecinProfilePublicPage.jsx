import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicDoctorProfile } from '../../services/profileService';
import MedecinProfilePublic from '../../components/profile/MedecinProfilePublic';

const MedecinProfilePublicPage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    getPublicDoctorProfile(id).then(res => setDoctor(res.data));
  }, [id]);

  if (!doctor) return <div>Chargement…</div>;

  return (
    <MedecinProfilePublic
      medecin={doctor}
      onPrendreRdv={() => { /* logique RDV, ex: navigation */ }}
      onEnvoyerMessage={() => { /* logique message sécurisé */ }}
      onLaisserAvis={() => { /* logique avis */ }}
    />
  );
};

export default MedecinProfilePublicPage;
