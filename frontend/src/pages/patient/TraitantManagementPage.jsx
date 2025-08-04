import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './TraitantManagementPage.css';

// Import des composants onglets
import MyTraitantsTab from './components/MyTraitantsTab';
import SearchDoctorsTab from './components/SearchDoctorsTab';
import RequestsHistoryTab from './components/RequestsHistoryTab';

// Import des services
import {
  getAllMedecins,
  getMyTraitants,
  getMyTraitantRequests,
  requestTraitant,
  cancelTraitantRequest,
  removeTraitant,
  setTraitantPrincipal
} from '../../services/traitantService';

const TraitantManagementPage = () => {
  const navigate = useNavigate();
  
  // États globaux partagés entre les onglets
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState({ success: '', error: '' });
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Données partagées
  const [traitants, setTraitants] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [requests, setRequests] = useState([]);
  
  // Méthodes de rafraîchissement des données
  const refreshTraitants = useCallback(async () => {
    try {
      const data = await getMyTraitants();
      setTraitants(data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des traitants:', error);
    }
  }, []);

  const refreshRequests = useCallback(async () => {
    try {
      const data = await getMyTraitantRequests();
      setRequests(data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    }
  }, []);

  const refreshMedecins = useCallback(async () => {
    try {
      const data = await getAllMedecins();
      setMedecins(data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
    }
  }, []);

  // Chargement initial de toutes les données
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setMessages({ success: '', error: '' });
        
        await Promise.all([
          refreshTraitants(),
          refreshMedecins(),
          refreshRequests()
        ]);
        
      } catch (error) {
        console.error('❌ Erreur chargement données:', error);
        setMessages({ 
          success: '', 
          error: 'Impossible de charger les données. Veuillez rafraîchir la page.' 
        });
      } finally {
        setLoading(false);
      }
    };

    loadAllData();

    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(() => {
      refreshRequests();
      refreshTraitants();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshTraitants, refreshRequests, refreshMedecins]);

  // Méthodes partagées pour les actions
  const handleRequestTraitant = async (doctorData) => {
    try {
      await requestTraitant(doctorData);
      await refreshRequests(); // Rafraîchir les demandes
      setMessages({ 
        success: `✅ Demande envoyée avec succès`, 
        error: '' 
      });
      
      // Basculer vers l'onglet des demandes pour voir le résultat
      setActiveTab(2);
      
      setTimeout(() => {
        setMessages(prev => ({ ...prev, success: '' }));
      }, 5000);
      
    } catch (error) {
      console.error('❌ Erreur envoi demande:', error);
      setMessages({ 
        success: '', 
        error: 'Échec de l\'envoi de la demande. Veuillez réessayer.' 
      });
    }
  };

  const handleRemoveTraitant = async (traitantId) => {
    try {
      await removeTraitant(traitantId);
      await refreshTraitants(); // Rafraîchir la liste
      setMessages({ 
        success: `✅ Médecin traitant supprimé`, 
        error: '' 
      });
      
      setTimeout(() => {
        setMessages(prev => ({ ...prev, success: '' }));
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erreur suppression traitant:', error);
      setMessages({ 
        success: '', 
        error: 'Impossible de supprimer ce médecin traitant.' 
      });
    }
  };

  const handleSetPrincipal = async (traitantId) => {
    try {
      await setTraitantPrincipal(traitantId);
      await refreshTraitants(); // Rafraîchir la liste
      setMessages({ 
        success: `✅ Médecin traitant principal défini`, 
        error: '' 
      });
      
      setTimeout(() => {
        setMessages(prev => ({ ...prev, success: '' }));
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erreur définition principal:', error);
      setMessages({ 
        success: '', 
        error: 'Impossible de définir ce médecin comme principal.' 
      });
    }
  };

  // Nouvelle fonction pour annuler une demande
  const handleCancelRequest = async (requestId) => {
    try {
      await cancelTraitantRequest(requestId);
      await refreshRequests(); // Rafraîchir les demandes
      setMessages({ 
        success: `✅ Demande annulée avec succès`, 
        error: '' 
      });
      
      setTimeout(() => {
        setMessages(prev => ({ ...prev, success: '' }));
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erreur annulation demande:', error);
      setMessages({ 
        success: '', 
        error: 'Impossible d\'annuler cette demande.' 
      });
    }
  };

  // Fonction pour refaire une demande (après refus)
  const handleRetryRequest = async (doctorData) => {
    try {
      await requestTraitant(doctorData);
      await refreshRequests(); // Rafraîchir les demandes
      setMessages({ 
        success: `✅ Nouvelle demande envoyée avec succès`, 
        error: '' 
      });
      
      // Basculer vers l'onglet des demandes pour voir le résultat
      setActiveTab(2);
      
      setTimeout(() => {
        setMessages(prev => ({ ...prev, success: '' }));
      }, 5000);
      
    } catch (error) {
      console.error('❌ Erreur nouvelle demande:', error);
      setMessages({ 
        success: '', 
        error: 'Échec de l\'envoi de la demande. Veuillez réessayer.' 
      });
    }
  };

  // Calcul des statistiques pour les badges des onglets
  const pendingRequestsCount = requests.filter(req => req.statut === 'en_attente').length;
  const traitantsCount = traitants.length;
  const medecinsCount = medecins.length;

  if (loading) {
    return (
      <div className="traitant-management-page">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Retour au tableau de bord
        </button>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Chargement des données...</h3>
          <p>Veuillez patienter pendant que nous récupérons toutes vos informations médicales</p>
        </div>
      </div>
    );
  }

  return (
    <div className="traitant-management-page">
      {/* En-tête principal */}
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Retour au tableau de bord
        </button>
        <div className="page-title">
          <h1>🏥 Gestion des Médecins Traitants</h1>
          <p>Trouvez, gérez et suivez vos relations avec vos médecins traitants</p>
        </div>
      </header>

      {/* Messages de notification globaux */}
      {messages.success && (
        <div className="notification notification--success">
          <span className="notification__icon">✅</span>
          {messages.success}
          <button 
            className="notification__close"
            onClick={() => setMessages(prev => ({ ...prev, success: '' }))}
          >
            ✕
          </button>
        </div>
      )}
      {messages.error && (
        <div className="notification notification--error">
          <span className="notification__icon">❌</span>
          {messages.error}
          <button 
            className="notification__close"
            onClick={() => setMessages(prev => ({ ...prev, error: '' }))}
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation par onglets */}
      <nav className="tabs-navigation">
        <button 
          className={`tab-button ${activeTab === 0 ? 'tab-button--active' : ''}`}
          onClick={() => setActiveTab(0)}
        >
          <span className="tab-button__icon">👑</span>
          <span className="tab-button__label">Mes Médecins Traitants</span>
          {traitantsCount > 0 && <span className="tab-button__badge">{traitantsCount}</span>}
        </button>
        
        <button 
          className={`tab-button ${activeTab === 1 ? 'tab-button--active' : ''}`}
          onClick={() => setActiveTab(1)}
        >
          <span className="tab-button__icon">🔍</span>
          <span className="tab-button__label">Rechercher un Médecin</span>
          <span className="tab-button__badge">{medecinsCount}</span>
        </button>
        
        <button 
          className={`tab-button ${activeTab === 2 ? 'tab-button--active' : ''}`}
          onClick={() => setActiveTab(2)}
        >
          <span className="tab-button__icon">📋</span>
          <span className="tab-button__label">Mes Demandes</span>
          {pendingRequestsCount > 0 && (
            <span className="tab-button__badge tab-button__badge--urgent">{pendingRequestsCount}</span>
          )}
        </button>
      </nav>

      {/* Contenu des onglets */}
      <main className="tab-content">
        {activeTab === 0 && (
          <MyTraitantsTab
            traitants={traitants}
            onRemoveTraitant={handleRemoveTraitant}
            onSetPrincipal={handleSetPrincipal}
            onSwitchToSearch={() => setActiveTab(1)}
            onRefresh={refreshTraitants}
          />
        )}
        
        {activeTab === 1 && (
          <SearchDoctorsTab
            medecins={medecins}
            requests={requests}
            onRequestTraitant={handleRequestTraitant}
            onSwitchToRequests={() => setActiveTab(2)}
            onRefresh={refreshMedecins}
          />
        )}
        
        {activeTab === 2 && (
          <RequestsHistoryTab
            requests={requests}
            medecins={medecins}
            onSwitchToSearch={() => setActiveTab(1)}
            onRefresh={refreshRequests}
            onCancelRequest={handleCancelRequest}
            onRetryRequest={handleRetryRequest}
          />
        )}
      </main>
    </div>
  );
};

export default TraitantManagementPage;
