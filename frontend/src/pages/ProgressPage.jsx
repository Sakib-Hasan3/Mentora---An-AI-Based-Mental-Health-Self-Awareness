import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/progress.css';

const ProgressPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('weekly');
    const [overview, setOverview] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [milestones, setMilestones] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, [activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [overviewData, chartData, milestonesData] = await Promise.all([
                api.get('/progress/overview'),
                api.get(`/progress/${activeTab}`),
                api.get('/progress/milestones')
            ]);
            setOverview(overviewData);
            setChartData(chartData);
            setMilestones(milestonesData);
        } catch (error) {
            console.error('Failed to fetch progress data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (trend) => {
        if (trend === 'improving') return '📈';
        if (trend === 'declining') return '📉';
        return '📊';
    };

    const getTrendText = (trend) => {
        if (trend === 'improving') return 'উন্নতি';
        if (trend === 'declining') return 'পতন';
        return 'স্থিতিশীল';
    };

    const getRecommendationColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    if (loading) {
        return (
            <div className="progress-loading">
                <div className="progress-spinner"></div>
            </div>
        );
    }

    const maxScore = 100;

    return (
        <div className="progress-container">
            <div className="progress-header-bar">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← ড্যাশবোর্ড
                </button>
                <h1>📊 প্রগ্রেস ট্র্যাকিং</h1>
                <div></div>
            </div>

            <div className="progress-content">
                {/* Overview Cards */}
                <div className="overview-grid">
                    <div className="overview-card">
                        <div className="overview-icon">📝</div>
                        <div className="overview-value">{overview?.total_assessments || 0}</div>
                        <div className="overview-label">মোট অ্যাসেসমেন্ট</div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-icon">⭐</div>
                        <div className="overview-value">{overview?.average_score || 0}%</div>
                        <div className="overview-label">গড় স্কোর</div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-icon">🏆</div>
                        <div className="overview-value">{overview?.best_score || 0}%</div>
                        <div className="overview-label">সেরা স্কোর</div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-icon">{getTrendIcon(overview?.trend)}</div>
                        <div className="overview-value">{getTrendText(overview?.trend)}</div>
                        <div className="overview-label">ট্রেন্ড</div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-icon">🔥</div>
                        <div className="overview-value">{overview?.current_streak || 0} দিন</div>
                        <div className="overview-label">বর্তমান ধারাবাহিকতা</div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-icon">⚡</div>
                        <div className="overview-value">{overview?.best_streak || 0} দিন</div>
                        <div className="overview-label">সেরা ধারাবাহিকতা</div>
                    </div>
                </div>

                {/* Improvement Section */}
                <div className="improvement-section">
                    <div className="improvement-card">
                        <div className="improvement-header">
                            <span className="improvement-title">উন্নতি</span>
                            <span className={`improvement-value ${overview?.improvement >= 0 ? 'positive' : 'negative'}`}>
                                {overview?.improvement >= 0 ? '+' : ''}{overview?.improvement || 0}%
                            </span>
                        </div>
                        <div className="improvement-bar-track">
                            <div 
                                className="improvement-bar-fill"
                                style={{ 
                                    width: `${Math.min(100, Math.max(0, 50 + (overview?.improvement || 0)))}%`,
                                    background: overview?.improvement >= 0 ? '#10b981' : '#ef4444'
                                }}
                            ></div>
                        </div>
                        <p className="improvement-text">
                            {overview?.improvement >= 0 ? 'আগের চেয়ে উন্নতি হয়েছে' : 'আগের চেয়ে পতন হয়েছে'}
                        </p>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="progress-chart-section">
                    <div className="chart-header">
                        <h3 className="chart-title">মানসিক সুস্থতার অগ্রগতি</h3>
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
                    
                    {chartData && (
                        <div className="progress-chart">
                            {chartData.data.map((value, index) => (
                                <div key={index} className="chart-column">
                                    <div 
                                        className="chart-bar"
                                        style={{ 
                                            height: `${(value / maxScore) * 180}px`,
                                            background: value >= 70 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444'
                                        }}
                                    >
                                        <span className="chart-bar-value">{value}%</span>
                                    </div>
                                    <div className="chart-label">{chartData.labels[index]}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Milestones Section */}
                <div className="milestones-section">
                    <h3 className="milestones-title">🎯 আপনার অর্জনসমূহ</h3>
                    <div className="milestones-grid">
                        {milestones?.milestones?.map((milestone, index) => (
                            <div key={index} className={`milestone-card ${milestone.achieved ? 'achieved' : 'locked'}`}>
                                <div className="milestone-icon">{milestone.icon}</div>
                                <div className="milestone-info">
                                    <h4 className="milestone-title">{milestone.title}</h4>
                                    <p className="milestone-date">{milestone.date}</p>
                                </div>
                                <div className="milestone-status">
                                    {milestone.achieved ? '✅' : '🔒'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendation Section */}
                <div className="recommendation-section">
                    <div className="recommendation-card" style={{ borderColor: getRecommendationColor(overview?.average_score || 0) }}>
                        <div className="recommendation-icon">💡</div>
                        <div className="recommendation-content">
                            <h4 className="recommendation-title">ব্যক্তিগত পরামর্শ</h4>
                            <p className="recommendation-text">{overview?.recommendation}</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="progress-actions">
                    <button onClick={() => navigate('/assessment')} className="action-btn-primary">
                        🧠 নতুন অ্যাসেসমেন্ট দিন
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="action-btn-secondary">
                        ← ড্যাশবোর্ডে ফিরুন
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProgressPage;
