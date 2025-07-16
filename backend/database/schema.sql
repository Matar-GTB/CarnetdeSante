-- database/schema.sql

-- Table: Utilisateurs (patients et médecins)
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    prenom VARCHAR(50) NOT NULL,
    nom VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    mot_de_passe VARCHAR(100) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('patient', 'medecin')) NOT NULL,
    
    -- Champs communs
    sexe VARCHAR(10),
    date_naissance DATE,
    groupe_sanguin VARCHAR(5),
    adresse TEXT,
    photo_profil VARCHAR(255),
    
    -- Champs spécifiques aux patients
    allergies TEXT,
    antecedents_medicaux TEXT,
    
    -- Champs spécifiques aux médecins
    specialite VARCHAR(100),
    etablissements TEXT,
    diplome VARCHAR(255),
    parcours_professionnel TEXT,
    langues TEXT,
    moyens_paiement TEXT,
    description TEXT,
    accepte_nouveaux_patients BOOLEAN DEFAULT TRUE,
    accepte_non_traitants BOOLEAN DEFAULT TRUE,
    horaires_travail TEXT,
    accessibilite TEXT,
    
    -- Sécurité et vérification
    token_reinitialisation VARCHAR(255),
    expiration_token_reinitialisation TIMESTAMP,
    est_verifie BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Documents médicaux
CREATE TABLE documents_medicaux (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    titre VARCHAR(100) NOT NULL,
    type_document VARCHAR(20) CHECK (type_document IN ('ordonnance', 'compte_rendu', 'examen', 'autre')) NOT NULL,
    categorie VARCHAR(50),
    url_fichier TEXT NOT NULL,
    date_document DATE DEFAULT CURRENT_DATE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Rendez-vous
CREATE TABLE rendezvous (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    medecin_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    date_rendezvous DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    type_rendezvous VARCHAR(50),
    statut VARCHAR(20) DEFAULT 'planifie' CHECK (statut IN ('planifie', 'termine', 'annule', 'reprogramme')),
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Vaccinations
CREATE TABLE vaccinations (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    nom_vaccin VARCHAR(100) NOT NULL,
    date_administration DATE NOT NULL,
    date_rappel DATE,
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Partages de documents
CREATE TABLE partages_documents (
    id SERIAL PRIMARY KEY,
    proprietaire_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    destinataire_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    date_expiration DATE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison pour les documents partagés
CREATE TABLE documents_partages (
    partage_id INT NOT NULL REFERENCES partages_documents(id) ON DELETE CASCADE,
    document_id INT NOT NULL REFERENCES documents_medicaux(id) ON DELETE CASCADE,
    PRIMARY KEY (partage_id, document_id)
);

-- Table: Journal des accès
CREATE TABLE journaux_acces (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    type_action VARCHAR(20) CHECK (type_action IN ('consultation', 'telechargement', 'modification', 'partage')) NOT NULL,
    type_cible VARCHAR(20) NOT NULL,
    id_cible INT NOT NULL,
    adresse_ip VARCHAR(45),
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Demandes de médecin traitant
CREATE TABLE demandes_medecin_traitant (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    medecin_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    message_demande TEXT,
    statut VARCHAR(20) CHECK (statut IN ('en_attente', 'accepte', 'refuse')) DEFAULT 'en_attente',
    message_reponse TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Médecins traitants (après acceptation)
CREATE TABLE relations_medecin_traitant (
    patient_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    medecin_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    date_debut DATE NOT NULL DEFAULT CURRENT_DATE,
    date_fin DATE,
    est_actif BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (patient_id, medecin_id)
);

-- Table: Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    type_notification VARCHAR(20) CHECK (type_notification IN ('rendezvous', 'vaccin', 'partage', 'rappel', 'securite')) NOT NULL,
    titre VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    est_lu BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Table des rappels programmés
CREATE TABLE IF NOT EXISTS rappels (
  id              SERIAL PRIMARY KEY,
  utilisateur_id  INTEGER NOT NULL REFERENCES utilisateurs(id),
  type_rappel     VARCHAR(50) NOT NULL,
  details         JSONB     NOT NULL,
  recurrence      VARCHAR(20) NOT NULL DEFAULT 'aucune',
  canaux          JSONB     NOT NULL DEFAULT '{}'::jsonb,
  createdAt       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Création des index pour améliorer les performances
CREATE INDEX idx_rendezvous_patient ON rendezvous(patient_id);
CREATE INDEX idx_rendezvous_medecin ON rendezvous(medecin_id);
CREATE INDEX idx_documents_utilisateur ON documents_medicaux(utilisateur_id);
CREATE INDEX idx_vaccinations_patient ON vaccinations(patient_id);
CREATE INDEX idx_journaux_acces_utilisateur ON journaux_acces(utilisateur_id);