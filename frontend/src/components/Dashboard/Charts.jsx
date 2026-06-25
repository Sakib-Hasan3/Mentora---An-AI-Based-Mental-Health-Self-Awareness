import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const Charts = () => {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState(null);
    const [activeTab, setActiveTab] = useState('weekly');

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const data = await api.get('/dashboard/chart-data');
                setChartData(data);
            } catch (error) {
                console.error('Failed to fetch chart data:', error);
            }
        };
        fetchChartData();
    }, []);

    return (
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
    );
};

export default Charts;