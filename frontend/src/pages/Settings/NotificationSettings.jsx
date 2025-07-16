// src/pages/Settings/NotificationSettings.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotificationSettingsApi,
  updateNotificationSettingsApi,
  getNotificationsApi,
  deleteNotificationApi,
  markNotificationAsReadApi
} from '../../services/notificationService';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({ email: true, sms: false, push: true });
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prefs = await getNotificationSettingsApi();
        const notifs = await getNotificationsApi();
        setSettings(prefs);
        setNotifications(notifs);
      } catch {
        setMessage('Erreur lors du chargement des données.');
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      await updateNotificationSettingsApi(settings);
      setMessage('✅ Préférences enregistrées.');
    } catch {
      setMessage('❌ Erreur lors de l’enregistrement.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotificationApi(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      setMessage('❌ Erreur lors de la suppression.');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsReadApi(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, est_lu: true } : n))
      );
    } catch {
      setMessage('❌ Erreur lecture.');
    }
  };

  return (
    <div className="notification-settings">
      <button className="btn-retour" onClick={() => navigate('/dashboard')}>⬅ Retour</button>
      <h2>⚙️ Réglages de notification</h2>
      {message && <p className="message">{message}</p>}

      <div className="preferences">
        <label>
          <input type="checkbox" checked={settings.email} onChange={e => setSettings({ ...settings, email: e.target.checked })} />
          Par Email
        </label>
        <label>
          <input type="checkbox" checked={settings.sms} onChange={e => setSettings({ ...settings, sms: e.target.checked })} />
          Par SMS
        </label>
        <label>
          <input type="checkbox" checked={settings.push} onChange={e => setSettings({ ...settings, push: e.target.checked })} />
          Notifications Push
        </label>
        <button onClick={handleSave}>💾 Enregistrer</button>
      </div>

      <h3>🔔 Historique des notifications</h3>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p>Aucune notification enregistrée.</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`notif-card ${n.est_lu ? 'lue' : 'non-lue'}`}>
              <div className="notif-content" onClick={() => handleMarkAsRead(n.id)}>
                <strong>{n.titre}</strong>
                <p>{n.message}</p>
                <small>{new Date(n.date_creation).toLocaleString()}</small>
              </div>
              <button onClick={() => handleDelete(n.id)} className="btn-supprimer">🗑 Supprimer</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
