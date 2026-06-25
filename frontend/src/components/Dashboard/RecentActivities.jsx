import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const RecentActivities = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState(null);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const activitiesData = await api.get('/dashboard/recent-activity');
                setActivities(activitiesData);
            } catch (error) {
                console.error('Failed to fetch activities data:', error);
            }
        };
        fetchActivities();
    }, []);

    return (
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
    );
};

export default RecentActivities;