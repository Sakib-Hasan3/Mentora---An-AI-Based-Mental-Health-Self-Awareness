// components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api'; // api ব্যবহার করুন, apiService নয়
import '../styles/header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const notificationRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Fetch notifications with error handling
    const fetchNotifications = async () => {
        if (!user || loading) return;
        
        setLoading(true);
        try {
            console.log('📢 Fetching notifications...');
            const response = await api.get('/notifications/', { 
                params: { limit: 5 } 
            });
            
            console.log('📢 Notifications response:', response);
            
            if (response && response.data) {
                setNotifications(response.data.notifications || []);
                setUnreadCount(response.data.unread_count || 0);
            } else if (response && response.notifications) {
                setNotifications(response.notifications || []);
                setUnreadCount(response.unread_count || 0);
            }
        } catch (error) {
            console.error('❌ Failed to fetch notifications:', error);
            
            if (error.response?.status === 401) {
                console.log('🔒 Unauthorized, logging out...');
                logout();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch notifications on mount and when user changes
    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setShowMobileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markNotificationAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(prev => prev.map(n => 
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('❌ Failed to mark as read:', error);
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

    const handleNotificationClick = (notification) => {
        markNotificationAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
        }
        setShowNotifications(false);
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logout();
            navigate('/login');
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navItems = [
        { path: '/dashboard', label: 'ড্যাশবোর্ড', icon: '📊' },
        { path: '/assessment', label: 'অ্যাসেসমেন্ট', icon: '🧠' },
        { path: '/quick-assessment', label: 'দ্রুত পরীক্ষা', icon: '⚡' },
        { path: '/wellness', label: 'ওয়েলনেস', icon: '🌿' },
        { path: '/progress', label: 'অগ্রগতি', icon: '📈' },
        { path: '/community', label: 'কমিউনিটি', icon: '👥' },
        { path: '/consultants', label: 'কনসালট্যান্ট', icon: '🧑‍⚕️' },
        { path: '/pricing', label: 'প্রিমিয়াম', icon: '💎' },
    ];

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <div className="header-logo" onClick={() => navigate('/dashboard')}>
                    <div className="logo-icon">🧠</div>
                    <div className="logo-text">
                        <h2>মেন্টাল সাথী</h2>
                        <p>আপনার মানসিক স্বাস্থ্যের সঙ্গী</p>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="header-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Right Section */}
                <div className="header-right">
                    {/* Notifications */}
                    <div className="notification-wrapper" ref={notificationRef}>
                        <button 
                            className="notification-btn"
                            onClick={() => setShowNotifications(!showNotifications)}
                            aria-label="Notifications"
                            disabled={loading}
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
                                    {loading ? (
                                        <div className="no-notifications">
                                            <div className="spinner-small"></div>
                                            <p>লোড হচ্ছে...</p>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="no-notifications">
                                            <span>📭</span>
                                            <p>কোনো নোটিফিকেশন নেই</p>
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div 
                                                key={notif.id}
                                                className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                                                onClick={() => handleNotificationClick(notif)}
                                            >
                                                <div className="notification-icon">
                                                    {notif.icon || '🔔'}
                                                </div>
                                                <div className="notification-content">
                                                    <div className="notification-title">
                                                        {notif.title_bn || notif.title}
                                                    </div>
                                                    <div className="notification-message">
                                                        {notif.message_bn || notif.message}
                                                    </div>
                                                    <div className="notification-time">
                                                        {formatDate(notif.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="notification-popup-footer">
                                    <button onClick={() => navigate('/notifications')}>
                                        সব নোটিফিকেশন দেখুন →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile */}
                    <div className="user-profile" onClick={() => navigate('/profile')}>
                        <div className="user-info">
                            <div className="user-name">{user?.name || 'ইউজার'}</div>
                            <div className="user-email">{user?.email || 'ইমেইল'}</div>
                        </div>
                        <div className="user-avatar">
                            {user?.name?.charAt(0) || 'ই'}
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button onClick={handleLogout} className="logout-btn" title="লগআউট">
                        🚪
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="mobile-menu-toggle"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        aria-label="Toggle menu"
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {showMobileMenu && (
                <div className="mobile-menu" ref={mobileMenuRef}>
                    <div className="mobile-menu-header">
                        <div className="mobile-user-info">
                            <div className="mobile-user-avatar">
                                {user?.name?.charAt(0) || 'ই'}
                            </div>
                            <div className="mobile-user-details">
                                <div className="mobile-user-name">{user?.name || 'ইউজার'}</div>
                                <div className="mobile-user-email">{user?.email || 'ইমেইল'}</div>
                            </div>
                        </div>
                    </div>
                    <nav className="mobile-nav">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => {
                                    navigate(item.path);
                                    setShowMobileMenu(false);
                                }}
                            >
                                <span className="mobile-nav-icon">{item.icon}</span>
                                <span className="mobile-nav-label">{item.label}</span>
                            </button>
                        ))}
                        <button 
                            className="mobile-nav-link logout-nav"
                            onClick={() => {
                                handleLogout();
                                setShowMobileMenu(false);
                            }}
                        >
                            <span className="mobile-nav-icon">🚪</span>
                            <span className="mobile-nav-label">লগআউট</span>
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;