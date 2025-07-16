// src/pages/notifications/NotificationsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotificationsApi,
  markNotificationAsReadApi,
  deleteNotificationApi
} from '../../services/notificationService';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsApi();
        setNotifications(data);
      } catch (err) {
        setMessage('Erreur chargement notifications.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteNotificationApi(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setMessage('❌ Erreur suppression notification.');
    }
  };
  

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsReadApi(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, est_lu: true } : n))
      );
    } catch (err) {
      setMessage('❌ Erreur lecture notification.');
    }
  };

  if (loading) return <p>Chargement des notifications...</p>;

  return (
    <div className="notifications-page">
      <button className="btn-retour" onClick={() => navigate('/dashboard')}>
        ⬅ Retour
      </button>

      <h2>🔔 Notifications reçues</h2>
      {message && <p className="message">{message}</p>}

      {notifications.length === 0 ? (
        <p>Aucune notification.</p>
      ) : (
        <div className="notifications-list">
          <div className="notifications-group">
  {notifications.some(n => !n.est_lu) && (
    <>
      <p className="section-label">🔵 Non lues</p>
      {notifications
        .filter(n => !n.est_lu)
        .map((n) => (
          <div key={n.id} className="notif-card non-lue">
            <div className="notif-content" onClick={() => handleMarkAsRead(n.id)}>
              <strong>{n.titre}</strong>
              <p>{n.message}</p>
              <small>{new Date(n.date_creation).toLocaleString()}</small>
            </div>
            <button onClick={() => handleDelete(n.id)} className="btn-supprimer">🗑</button>
          </div>
        ))}
    </>
  )}

  {notifications.some(n => n.est_lu) && (
    <>
      <p className="section-label">⚪ Déjà lues</p>
      {notifications
        .filter(n => n.est_lu)
        .map((n) => (
          <div key={n.id} className="notif-card lue">
            <div className="notif-content">
              <strong>{n.titre}</strong>
              <p>{n.message}</p>
              <small>{new Date(n.date_creation).toLocaleString()}</small>
            </div>
            <button onClick={() => handleDelete(n.id)} className="btn-supprimer">🗑</button>
          </div>
        ))}
    </>
  )}
</div>

        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
