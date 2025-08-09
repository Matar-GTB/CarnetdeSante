// src/pages/notifications/NotificationsPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotificationsApi,
  markNotificationAsReadApi,
  deleteNotificationApi
} from '../../services/notificationService';
import { FaBell, FaCheckCircle, FaTrashAlt, FaChevronLeft, FaRegEnvelopeOpen, FaRegEnvelope } from 'react-icons/fa';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const notificationsRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedNotif, setSelectedNotif] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsApi();
        setNotifications(data);
        notificationsRef.current = data;
      } catch (err) {
        setMessage('Erreur chargement notifications.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();

    // Marquer toutes les notifications comme lues à la sortie de la page
    return () => {
      const markAllAsRead = async () => {
        const notRead = notificationsRef.current.filter(n => !n.est_lu);
        if (notRead.length > 0) {
          await Promise.all(notRead.map(n => markNotificationAsReadApi(n.id)));
        }
      };
      markAllAsRead();
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteNotificationApi(id);
      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== id);
        notificationsRef.current = updated;
        return updated;
      });
      if (selectedNotif && selectedNotif.id === id) setSelectedNotif(null);
    } catch (err) {
      setMessage('❌ Erreur suppression notification.');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsReadApi(id);
      setNotifications(prev => {
        const updated = prev.map(n => (n.id === id ? { ...n, est_lu: true } : n));
        notificationsRef.current = updated;
        return updated;
      });
    } catch (err) {
      setMessage('❌ Erreur lecture notification.');
    }
  };

  // Ouvre la notification (modal) et la marque comme lue si besoin
  const openNotif = async (notif) => {
    setSelectedNotif(notif);
    if (!notif.est_lu) {
      await handleMarkAsRead(notif.id);
    }
  };

  const closeNotif = () => setSelectedNotif(null);

  if (loading) return (
    <div className="notifications-page">
      <div className="loading-spinner"></div>
      <p>Chargement des notifications...</p>
    </div>
  );

  return (
    <div className="notifications-page">
      <button className="btn-retour" onClick={() => navigate('/dashboard')}>
        <FaChevronLeft style={{marginRight:6}} /> Retour
      </button>

      <h2 style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
        <FaBell color="#3b82f6" size={24} /> Notifications reçues
      </h2>
      {message && <p className="message">{message}</p>}

      {notifications.length === 0 ? (
        <p style={{textAlign:'center',color:'#64748b'}}>Aucune notification.</p>
      ) : (
        <div className="notifications-list">
          <div className="notifications-group">
            {notifications.some(n => !n.est_lu) && (
              <>
                <p className="section-label"><FaRegEnvelope style={{marginRight:6}} color="#3b82f6"/> Non lues</p>
                {notifications
                  .filter(n => !n.est_lu)
                  .map((n) => (
                    <div key={n.id} className="notif-card non-lue" onClick={() => openNotif(n)}>
                      <div className="notif-content">
                        <strong>{n.titre}</strong>
                        <p>{n.message.length > 80 ? n.message.slice(0,80)+'...' : n.message}</p>
                        <small>{new Date(n.date_creation).toLocaleString()}</small>
                      </div>
                      <button onClick={e => {e.stopPropagation(); handleDelete(n.id);}} className="btn-supprimer" title="Supprimer">
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
              </>
            )}

            {notifications.some(n => n.est_lu) && (
              <>
                <p className="section-label"><FaRegEnvelopeOpen style={{marginRight:6}} color="#64748b"/> Déjà lues</p>
                {notifications
                  .filter(n => n.est_lu)
                  .map((n) => (
                    <div key={n.id} className="notif-card lue" onClick={() => openNotif(n)}>
                      <div className="notif-content">
                        <strong>{n.titre}</strong>
                        <p>{n.message.length > 80 ? n.message.slice(0,80)+'...' : n.message}</p>
                        <small>{new Date(n.date_creation).toLocaleString()}</small>
                      </div>
                      <button onClick={e => {e.stopPropagation(); handleDelete(n.id);}} className="btn-supprimer" title="Supprimer">
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal notification */}
      {selectedNotif && (
        <div className="modal-overlay" onClick={closeNotif}>
          <div className="modal-content" style={{maxWidth:420}} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <h3 style={{display:'flex',alignItems:'center',gap:8}}>
                <FaBell color="#3b82f6" />
                {selectedNotif.titre}
              </h3>
              <button className="btn-supprimer" style={{marginLeft:12}} onClick={() => handleDelete(selectedNotif.id)} title="Supprimer">
                <FaTrashAlt />
              </button>
            </div>
            <div style={{marginBottom:16}}>
              <p style={{fontSize:'1.08rem',color:'#1e293b'}}>{selectedNotif.message}</p>
              <small style={{color:'#64748b'}}>{new Date(selectedNotif.date_creation).toLocaleString()}</small>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <button className="btn-retour" onClick={closeNotif} style={{marginTop:0}}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
