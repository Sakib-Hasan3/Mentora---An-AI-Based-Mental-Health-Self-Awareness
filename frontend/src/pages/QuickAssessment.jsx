import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MentalHealthCheck from '../components/AssessmentWidget/MentalHealthCheck';
import FullAssessment from '../components/AssessmentWidget/FullAssessment';
import '../styles/assessment-widget.css';

const QuickAssessment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('quick');

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="assessment-widget-container">
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={() => navigate('/dashboard')} className="back-btn" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#10b981', cursor: 'pointer' }}>
                    ← ড্যাশবোর্ড
                </button>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button 
                        onClick={() => setMode('quick')}
                        className={`mode-btn ${mode === 'quick' ? 'active' : ''}`}
                        style={{ padding: '0.5rem 1rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', background: mode === 'quick' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', color: mode === 'quick' ? '#10b981' : '#a8c0b5', cursor: 'pointer' }}
                    >
                        ⚡ দ্রুত পরীক্ষা
                    </button>
                    <button 
                        onClick={() => setMode('full')}
                        className={`mode-btn ${mode === 'full' ? 'active' : ''}`}
                        style={{ padding: '0.5rem 1rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', background: mode === 'full' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', color: mode === 'full' ? '#10b981' : '#a8c0b5', cursor: 'pointer' }}
                    >
                        📋 সম্পূর্ণ পরীক্ষা (১৭ প্রশ্ন)
                    </button>
                </div>
            </div>
            {mode === 'quick' ? <MentalHealthCheck /> : <FullAssessment />}
        </div>
    );
};

export default QuickAssessment;