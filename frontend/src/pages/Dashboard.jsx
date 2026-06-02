import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../styles/dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [activities, setActivities] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('weekly');

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
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'সুপ্রভাত';
        if (hour < 18) return 'শুভ বিকেল';
        return 'শুভ সন্ধ্যা';
    };

    const features = [
        { icon: '🧠', title: 'মানসিক স্বাস্থ্য পরীক্ষা', desc: 'এআই-চালিত বিশ্লেষণ পান' },
        { icon: '📊', title: 'প্রগ্রেস ট্র্যাকিং', desc: 'আপনার উন্নতি পর্যবেক্ষণ করুন' },
        { icon: '💬', title: '২৪/৭ সাপোর্ট', desc: 'যেকোনো সময় সাহায্য নিন' },
        { icon: '🔒', title: '১০০% গোপনীয়', desc: 'আপনার তথ্য নিরাপদ' },
        { icon: '📱', title: 'মোবাইল ফ্রেন্ডলি', desc: 'যেকোনো ডিভাইসে ব্যবহার করুন' },
        { icon: '👥', title: 'কমিউনিটি সাপোর্ট', desc: 'অন্যদের সাথে সংযোগ করুন' }
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
            {/* Header */}
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
                        <button className="notification-btn">
                            🔔
                            <span className="notification-badge">৩</span>
                        </button>
                        
                        <div className="user-profile">
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

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Welcome Banner */}
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

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-title">মানসিক সুস্থতা স্কোর</span>
                            <div className="stat-icon" style={{ background: '#f3e8ff' }}>🧠</div>
                        </div>
                        <div className="stat-value">{currentScore}%</div>
                        <div className="stat-change positive">
                            ↑ {stats?.improvement || '0%'} আগের থেকে
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progressWidth}%` }}></div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-title">মোট অ্যাসেসমেন্ট</span>
                            <div className="stat-icon" style={{ background: '#e0f2fe' }}>📝</div>
                        </div>
                        <div className="stat-value">{stats?.total_assessments || 0}</div>
                        <div className="stat-change positive">সদস্য {stats?.member_since || 'জুন ২০২৪'} থেকে</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-title">স্ট্রেস লেভেল</span>
                            <div className="stat-icon" style={{ background: '#ffedd5' }}>😰</div>
                        </div>
                        <div className="stat-value">{stats?.stress_level || 0}%</div>
                        <div className="stat-change negative">↓ ১২% গত সপ্তাহে</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-title">মেডিটেশন সেশন</span>
                            <div className="stat-icon" style={{ background: '#dcfce7' }}>🧘</div>
                        </div>
                        <div className="stat-value">{stats?.meditation_sessions || 0}</div>
                        <div className="stat-change positive">↑ ৩ এই সপ্তাহে</div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="features-section">
                    <div className="section-header">
                        <h3 className="section-title">🌟 মেন্টাল সাথীর বিশেষ ফিচারসমূহ</h3>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-item">
                                <div className="feature-icon">{feature.icon}</div>
                                <div className="feature-text">
                                    <h4>{feature.title}</h4>
                                    <p>{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chart Section */}
                <div className="chart-section">
                    <div className="chart-header">
                        <h3 className="chart-title">📈 আপনার মানসিক স্বাস্থ্যের অগ্রগতি</h3>
                        <div className="chart-tabs">
                            {['weekly', 'monthly', 'yearly'].map(tab => (
                                <button
                                    key={tab}
                                    className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'weekly' ? 'সাপ্তাহিক' : tab === 'monthly' ? 'মাসিক' : 'বার্ষিক'}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {chartData && chartData.labels && chartData.data && chartData.data.length > 0 && (
                        <div className="chart-bars">
                            {chartData.labels.slice(-7).map((label, index) => {
                                const value = chartData.data[chartData.data.length - 7 + index] || 0;
                                return (
                                    <div key={index} className="chart-bar-item">
                                        <div 
                                            className="chart-bar" 
                                            style={{ height: `${Math.max(40, (value / 100) * 150)}px` }}
                                        ></div>
                                        <div className="chart-label">{label}</div>
                                        <div className="chart-label" style={{ fontWeight: 'bold' }}>{value}%</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {chartData && (!chartData.data || chartData.data.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#6b7280' }}>এখনো কোনো অ্যাসেসমেন্ট নেই।</p>
                            <button className="action-btn" style={{ background: '#667eea', color: 'white', marginTop: '1rem' }}>
                                প্রথম অ্যাসেসমেন্ট দিন →
                            </button>
                        </div>
                    )}
                </div>

                {/* Recent Activities */}
                <div className="activities-section">
                    <div className="section-header">
                        <h3 className="section-title">⏰ সাম্প্রতিক কার্যকলাপ</h3>
                        <a href="#" className="view-all">সব দেখুন →</a>
                    </div>
                    
                    <div className="activity-list">
                        {activities?.activities?.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <div className="activity-icon" style={{ background: `${activity.color}15` }}>
                                    {activity.icon}
                                </div>
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

                {/* Quick Actions */}
                <div className="actions-grid">
                    <div className="action-card" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                        <div className="action-icon">🧠</div>
                        <h4 className="action-title">মানসিক স্বাস্থ্য পরীক্ষা</h4>
                        <p className="action-desc">আপনার মানসিক অবস্থার দ্রুত বিশ্লেষণ পান</p>
                        <button className="action-btn">শুরু করুন →</button>
                    </div>
                    
                    <div className="action-card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <div className="action-icon">🧘</div>
                        <h4 className="action-title">মেডিটেশন সেশন</h4>
                        <p className="action-desc">১০ মিনিটের গাইডেড মেডিটেশন</p>
                        <button className="action-btn">শুরু করুন →</button>
                    </div>
                    
                    <div className="action-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <div className="action-icon">💬</div>
                        <h4 className="action-title">বিশেষজ্ঞের সাথে কথা বলুন</h4>
                        <p className="action-desc">প্রফেশনাল কাউন্সেলরের সাথে সংযোগ করুন</p>
                        <button className="action-btn">বুক করুন →</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
