import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [activities, setActivities] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('weekly');
    const [showNotifications, setShowNotifications] = useState(false);
    const [quickAssessmentResult, setQuickAssessmentResult] = useState(null);
    const [showQuickAssessment, setShowQuickAssessment] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsData, chartData, activitiesData] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/chart-data'),
                    api.get('/dashboard/recent-activity')
                ]);
                setStats(statsData);
                setChartData(chartData);
                setActivities(activitiesData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDashboardData();
        fetchNotifications();
        fetchQuickAssessmentHistory();
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

    const fetchQuickAssessmentHistory = async () => {
        try {
            const data = await api.get('/ml-assessment/history');
            if (data.history && data.history.length > 0) {
                setQuickAssessmentResult(data.history[0]);
            }
        } catch (error) {
            console.error('Failed to fetch assessment history:', error);
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
        return `${Math.floor(diff / 1440)} দিন আগে`;
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'সুপ্রভাত';
        if (hour < 18) return 'শুভ বিকেল';
        return 'শুভ সন্ধ্যা';
    };

    const features = [
        { 
            icon: '🧠', 
            title: 'মানসিক স্বাস্থ্য পরীক্ষা', 
            desc: 'এআই-চালিত বিশ্লেষণ পান',
            route: '/assessment',
            color: 'linear-gradient(135deg, #667eea, #764ba2)'
        },
        { 
            icon: '⚡', 
            title: 'দ্রুত মানসিক স্বাস্থ্য পরীক্ষা', 
            desc: '৪টি প্রশ্নে ঝুঁকি বিশ্লেষণ (71.55% নির্ভুল)',
            route: '/quick-assessment',
            color: 'linear-gradient(135deg, #10b981, #059669)',
            isNew: true
        },
        { 
            icon: '📊', 
            title: 'প্রগ্রেস ট্র্যাকিং', 
            desc: 'আপনার উন্নতি পর্যবেক্ষণ করুন',
            route: '/progress',
            color: 'linear-gradient(135deg, #10b981, #059669)'
        },
        { 
            icon: '📚', 
            title: 'বুক জার্নাল', 
            desc: 'মানসিক স্বাস্থ্য সম্পর্কিত বই পড়ুন',
            route: '/books',
            color: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        { 
            icon: '👥', 
            title: 'কমিউনিটি', 
            desc: 'ডিভিশন ভিত্তিক গ্রুপ চ্যাট',
            route: '/community',
            color: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        { 
            icon: '🧑‍⚕️', 
            title: 'কনসালট্যান্ট', 
            desc: 'বিশেষজ্ঞের সাথে পরামর্শ করুন',
            route: '/consultants',
            color: 'linear-gradient(135deg, #ef4444, #dc2626)'
        },
        { 
            icon: '💬', 
            title: '২৪/৭ সাপোর্ট', 
            desc: 'যেকোনো সময় সাহায্য নিন',
            route: '/support',
            color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        },
        { 
            icon: '🔒', 
            title: 'গোপনীয়তা', 
            desc: 'আপনার তথ্য নিরাপদ',
            route: '/privacy',
            color: 'linear-gradient(135deg, #6b7280, #4b5563)'
        },
        { 
            icon: '📱', 
            title: 'মোবাইল ফ্রেন্ডলি', 
            desc: 'যেকোনো ডিভাইসে ব্যবহার করুন',
            route: '/mobile',
            color: 'linear-gradient(135deg, #14b8a6, #0d9488)'
        }
    ];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    const currentScore = stats?.mental_health_score || 0;
    const progressWidth = (currentScore / 100) * 100;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="logo">
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
                        
                        <div className="user-profile" onClick={() => navigate('/profile')}>
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

            <main className="dashboard-main">
                <div className="welcome-banner">
                    <div className="welcome-text">
                        <h3>{getGreeting()}!</h3>
                        <h1>{user?.name?.split(' ')[0]} 👋</h1>
                        <p>আজ আপনার দিন কেমন যাচ্ছে? আপনার মানসিক স্বাস্থ্যের যাত্রা এগিয়ে চলছে।</p>
                    </div>
                    <div className="welcome-emoji">
                        {currentScore >= 70 ? '😊' : currentScore >= 40 ? '😐' : '😟'}
                    </div>
                </div>

                {/* Quick Assessment Banner */}
                <div 
                    className="quick-assessment-banner"
                    onClick={() => navigate('/quick-assessment')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="quick-assessment-content">
                        <div className="quick-assessment-icon">⚡</div>
                        <div className="quick-assessment-text">
                            <h3>দ্রুত মানসিক স্বাস্থ্য পরীক্ষা</h3>
                            <p>৪টি প্রশ্নের উত্তর দিন - AI মডেল 71.55% নির্ভুলতায় বিশ্লেষণ করবে</p>
                        </div>
                        <div className="quick-assessment-arrow">→</div>
                    </div>
                </div>

                {/* Quick Assessment Result Card (if exists) */}
                {quickAssessmentResult && (
                    <div className="quick-result-card">
                        <div className="quick-result-header">
                            <span className="quick-result-icon">📊</span>
                            <span className="quick-result-title">আপনার সর্বশেষ দ্রুত মূল্যায়ন</span>
                        </div>
                        <div className="quick-result-body">
                            <div className="quick-result-score">
                                ঝুঁকি স্কোর: <strong>{Math.round(quickAssessmentResult.risk_score * 100)}%</strong>
                            </div>
                            <div className={`quick-result-status ${quickAssessmentResult.needs_treatment ? 'needs-treatment' : 'safe'}`}>
                                {quickAssessmentResult.needs_treatment ? '⚠️ পরামর্শ প্রয়োজন' : '✅ সুস্থ অবস্থায় আছেন'}
                            </div>
                        </div>
                        <div className="quick-result-footer">
                            <button onClick={() => navigate('/quick-assessment')} className="quick-result-btn">
                                বিস্তারিত দেখুন →
                            </button>
                        </div>
                    </div>
                )}

                <div className="stats-grid">
                    <div className="stat-card" onClick={() => navigate('/assessment')} style={{ cursor: 'pointer' }}>
                        <div className="stat-header">
                            <span className="stat-title">মানসিক সুস্থতা স্কোর</span>
                            <div className="stat-icon" style={{ background: '#f3e8ff' }}>🧠</div>
                        </div>
                        <div className="stat-value">{currentScore}%</div>
                        <div className="stat-change positive">↑ {stats?.improvement || '0%'} আগের থেকে</div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressWidth}%` }}></div></div>
                    </div>

                    <div className="stat-card" onClick={() => navigate('/assessment/history')} style={{ cursor: 'pointer' }}>
                        <div className="stat-header">
                            <span className="stat-title">মোট অ্যাসেসমেন্ট</span>
                            <div className="stat-icon" style={{ background: '#e0f2fe' }}>📝</div>
                        </div>
                        <div className="stat-value">{stats?.total_assessments || 0}</div>
                        <div className="stat-change positive">সদস্য {stats?.member_since || 'জুন ২০২৪'} থেকে</div>
                    </div>

                    <div className="stat-card" onClick={() => navigate('/stress-management')} style={{ cursor: 'pointer' }}>
                        <div className="stat-header">
                            <span className="stat-title">স্ট্রেস লেভেল</span>
                            <div className="stat-icon" style={{ background: '#ffedd5' }}>😰</div>
                        </div>
                        <div className="stat-value">{stats?.stress_level || 0}%</div>
                        <div className="stat-change negative">↓ ১২% গত সপ্তাহে</div>
                    </div>

                    <div className="stat-card" onClick={() => navigate('/meditation')} style={{ cursor: 'pointer' }}>
                        <div className="stat-header">
                            <span className="stat-title">মেডিটেশন সেশন</span>
                            <div className="stat-icon" style={{ background: '#dcfce7' }}>🧘</div>
                        </div>
                        <div className="stat-value">{stats?.meditation_sessions || 0}</div>
                        <div className="stat-change positive">↑ ৩ এই সপ্তাহে</div>
                    </div>
                </div>

                <div className="features-section">
                    <div className="section-header"><h3 className="section-title">🌟 মেন্টাল সাথীর বিশেষ ফিচারসমূহ</h3></div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-item" onClick={() => navigate(feature.route)} style={{ cursor: 'pointer' }}>
                                <div className="feature-icon" style={{ background: feature.color }}>{feature.icon}</div>
                                <div className="feature-text">
                                    <h4>{feature.title} {feature.isNew && <span className="new-badge">NEW</span>}</h4>
                                    <p>{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-section">
                    <div className="chart-header">
                        <h3 className="chart-title">📈 আপনার মানসিক স্বাস্থ্যের অগ্রগতি</h3>
                        <div className="chart-tabs">
                            {['weekly', 'monthly', 'yearly'].map(tab => (
                                <button key={tab} className={`chart-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                                    {tab === 'weekly' ? 'সাপ্তাহিক' : tab === 'monthly' ? 'মাসিক' : 'বার্ষিক'}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {chartData && chartData.labels && chartData.data && chartData.data.length > 0 && (
                        <div className="chart-bars" onClick={() => navigate('/progress')} style={{ cursor: 'pointer' }}>
                            {chartData.labels.slice(-7).map((label, index) => {
                                const value = chartData.data[chartData.data.length - 7 + index] || 0;
                                return (
                                    <div key={index} className="chart-bar-item">
                                        <div className="chart-bar" style={{ height: `${Math.max(40, (value / 100) * 150)}px` }}></div>
                                        <div className="chart-label">{label}</div>
                                        <div className="chart-label" style={{ fontWeight: 'bold' }}>{value}%</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="activities-section">
                    <div className="section-header">
                        <h3 className="section-title">⏰ সাম্প্রতিক কার্যকলাপ</h3>
                        <button onClick={() => navigate('/activities')} className="view-all">সব দেখুন →</button>
                    </div>
                    <div className="activity-list">
                        {activities?.activities?.slice(0, 4).map((activity, index) => (
                            <div key={index} className="activity-item" style={{ cursor: 'pointer' }}>
                                <div className="activity-icon" style={{ background: `${activity.color}15` }}>{activity.icon}</div>
                                <div className="activity-content">
                                    <div className="activity-title">{activity.title}</div>
                                    <div className="activity-desc">{activity.description}</div>
                                    <div className="activity-time">{activity.date}</div>
                                </div>
                                <div className="activity-arrow">→</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="actions-grid">
                    <div className="action-card" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', cursor: 'pointer' }} onClick={() => navigate('/assessment')}>
                        <div className="action-icon">🧠</div>
                        <h4 className="action-title">মানসিক স্বাস্থ্য পরীক্ষা</h4>
                        <p className="action-desc">আপনার মানসিক অবস্থার দ্রুত বিশ্লেষণ পান</p>
                        <button className="action-btn">শুরু করুন →</button>
                    </div>
                    
                    <div className="action-card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', cursor: 'pointer' }} onClick={() => navigate('/quick-assessment')}>
                        <div className="action-icon">⚡</div>
                        <h4 className="action-title">দ্রুত পরীক্ষা</h4>
                        <p className="action-desc">৪টি প্রশ্নে ঝুঁকি বিশ্লেষণ (71.55% নির্ভুল)</p>
                        <button className="action-btn">শুরু করুন →</button>
                    </div>
                    
                    <div className="action-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', cursor: 'pointer' }} onClick={() => navigate('/consultants')}>
                        <div className="action-icon">💬</div>
                        <h4 className="action-title">বিশেষজ্ঞের সাথে কথা বলুন</h4>
                        <p className="action-desc">প্রফেশনাল কাউন্সেলরের সাথে সংযোগ করুন</p>
                        <button className="action-btn">বুক করুন →</button>
                    </div>
                </div>
            </main>

            <style>{`
                .quick-assessment-banner {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.08));
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 16px;
                    padding: 1rem 1.5rem;
                    margin-bottom: 2rem;
                    transition: all 0.3s;
                }
                .quick-assessment-banner:hover {
                    transform: translateY(-2px);
                    background: rgba(16, 185, 129, 0.2);
                }
                .quick-assessment-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .quick-assessment-icon {
                    font-size: 2rem;
                }
                .quick-assessment-text {
                    flex: 1;
                }
                .quick-assessment-text h3 {
                    color: #10b981;
                    font-size: 1.1rem;
                    margin-bottom: 0.25rem;
                }
                .quick-assessment-text p {
                    color: #a8c0b5;
                    font-size: 0.85rem;
                }
                .quick-assessment-arrow {
                    color: #10b981;
                    font-size: 1.5rem;
                }
                .quick-result-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 1rem;
                    margin-bottom: 2rem;
                }
                .quick-result-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .quick-result-icon {
                    font-size: 1.2rem;
                }
                .quick-result-title {
                    color: #a8c0b5;
                    font-size: 0.85rem;
                }
                .quick-result-body {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .quick-result-score {
                    color: #eff8f3;
                    font-size: 0.9rem;
                }
                .quick-result-status {
                    font-size: 0.85rem;
                    padding: 0.2rem 0.6rem;
                    border-radius: 20px;
                }
                .quick-result-status.needs-treatment {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                .quick-result-status.safe {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                }
                .quick-result-btn {
                    background: none;
                    border: none;
                    color: #10b981;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                .new-badge {
                    background: #ef4444;
                    color: white;
                    font-size: 0.6rem;
                    padding: 0.1rem 0.3rem;
                    border-radius: 4px;
                    margin-left: 0.3rem;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;