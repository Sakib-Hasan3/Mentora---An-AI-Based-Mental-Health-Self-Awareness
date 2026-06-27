import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const StatsGrid = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const statsData = await api.get('/dashboard/stats');
                setStats(statsData);
            } catch (error) {
                console.error('Failed to fetch stats data:', error);
            }
        };
        fetchStats();
    }, []);

    const currentScore = stats?.mental_health_score || 0;
    const progressWidth = (currentScore / 100) * 100;

    return (
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
    );
};

export default StatsGrid;