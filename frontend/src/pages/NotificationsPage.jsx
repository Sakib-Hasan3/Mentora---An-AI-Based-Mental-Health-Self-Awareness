import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import Header from '../components/Header';
import '../styles/notifications.css';

const NotificationsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        total,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadMore,
        refresh
    } = useNotifications();

    const observerRef = useRef();
    const lastNotificationRef = useRef();

    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();
        
        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && notifications.length < total && !loading) {
                loadMore();
            }
        });
        
        if (lastNotificationRef.current) {
            observerRef.current.observe(lastNotificationRef.current);
        }
        
        return () => observerRef.current?.disconnect();
    }, [notifications, total, loading]);

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

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getTypeBadge = (type) => {
        const types = {
            success: { class: 'type-success', text: 'সফল' },
            warning: { class: 'type-warning', text: 'সতর্কতা' },
            error: { class: 'type-error', text: 'জরুরি' },
            info: { class: 'type-info', text: 'তথ্য' }
        };
        return types[type] || types.info;
    };

    return (
        <div className="notifications-container" style={{ paddingTop: '70px' }}>
            <Header />
            <div className="notifications-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← ড্যাশবোর্ড
                </button>
                <h1>🔔 নোটিফিকেশন {unreadCount > 0 && `(${unreadCount})`}</h1>
                <div className="notifications-actions">
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="mark-all-btn">
                            সব পড়া হয়েছে
                        </button>
                    )}
                    <button onClick={refresh} className="refresh-btn">
                        🔄 রিফ্রেশ
                    </button>
                </div>
            </div>

            <div className="notifications-content">
                {loading && notifications.length === 0 ? (
                    <div className="loading-spinner">
                        <div className="books-spinner"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔔</div>
                        <h3>কোনো নোটিফিকেশন নেই</h3>
                        <p>আপনার সব নোটিফিকেশন এখানে দেখা যাবে</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map((notification, index) => {
                            const typeBadge = getTypeBadge(notification.type);
                            return (
                                <div
                                    key={notification.id}
                                    ref={index === notifications.length - 1 ? lastNotificationRef : null}
                                    className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-header">
                                        <span className="notification-icon">{notification.icon || '🔔'}</span>
                                        <span className="notification-title">
                                            {notification.title_bn || notification.title}
                                            <span className={`type-badge ${typeBadge.class}`}>
                                                {typeBadge.text}
                                            </span>
                                        </span>
                                        <span className="notification-time">
                                            {formatDate(notification.created_at)}
                                        </span>
                                    </div>
                                    <div className="notification-message">
                                        {notification.message_bn || notification.message}
                                    </div>
                                    <div className="notification-footer">
                                        <button 
                                            className="notification-action"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleNotificationClick(notification);
                                            }}
                                        >
                                            বিস্তারিত →
                                        </button>
                                        <button 
                                            className="notification-action delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('নোটিফিকেশন ডিলিট করতে চান?')) {
                                                    deleteNotification(notification.id);
                                                }
                                            }}
                                        >
                                            ডিলিট
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {notifications.length < total && (
                            <button 
                                onClick={loadMore} 
                                disabled={loading}
                                className="load-more-btn"
                            >
                                {loading ? 'লোড হচ্ছে...' : 'আরও দেখুন ↓'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
