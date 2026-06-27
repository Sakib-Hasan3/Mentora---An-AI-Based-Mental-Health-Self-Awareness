import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const DashboardHeader = ({ user, logout }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await api.get('/notifications/?limit=5');
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(prev => prev.map(n => 
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000 / 60);
        
        if (diff < 1) return 'এখনই';
        if (diff < 60) return `${diff} মিনিট আগে`;
        if (diff < 1440) return `${Math.floor(diff / 60)} ঘণ্টা আগে`;
        if (diff < 43200) return `${Math.floor(diff / 1440)} দিন আগে`;
        return d.toLocaleDateString('bn-BD');
    };

    return (
        <header className="dashboard-header">
            <div className="dashboard-header-content">
                <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                    <div className="logo-icon">🧠</div>
                    <div className="logo-text">
                        <h2>মেন্টাল সাথী</h2>
                        <p>আপনার মানসিক স্বাস্থ্যের সঙ্গী</p>
                    </div>
                </div>
                
                <div className="user-menu">
                    <div className="notification-dropdown">
                        <button 
                            className="notification-btn"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>
                        
                        {showNotifications && (
                            <div className="notification-popup">
                                <div className="notification-popup-header">
                                    <span>নোটিফিকেশন</span>
                                    <button onClick={() => setShowNotifications(false)}>✕</button>
                                </div>
                                <div className="notification-popup-list">
                                    {notifications.length === 0 ? (
                                        <div className="no-notifications">কোনো নোটিফিকেশন নেই</div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div 
                                                key={notif.id}
                                                className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                                                onClick={() => {
                                                    markNotificationAsRead(notif.id);
                                                    if (notif.link) navigate(notif.link);
                                                    setShowNotifications(false);
                                                }}
                                            >
                                                <div className="notification-icon">{notif.icon || '🔔'}</div>
                                                <div className="notification-content">
                                                    <div className="notification-title">{notif.title_bn || notif.title}</div>
                                                    <div className="notification-message">{notif.message_bn || notif.message}</div>
                                                    <div className="notification-time">{formatDate(notif.created_at)}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="notification-popup-footer">
                                    <button onClick={() => navigate('/notifications')}>সব নোটিফিকেশন দেখুন →</button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="user-profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                        <div className="user-info">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>
                        <div className="user-avatar">
                            {user?.name?.charAt(0) || 'ই'}
                        </div>
                    </div>
                    
                    <button onClick={logout} className="logout-btn" title="লগআউট">
                        🚪
                    </button>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
